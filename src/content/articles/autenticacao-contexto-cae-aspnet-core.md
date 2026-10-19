---
pubDate: 2026-01-05
updatedDate: 2026-10-18
author: Pedro Soucheff
tags:
  - entra-id
  - authentication-context
  - cae
  - conditional-access
  - aspnet-core
  - zero-trust
i18n:
  pt:
    title: "Autenticação Baseada em Contexto e CAE (Continuous Access Evaluation) em Aplicações ASP.NET Core"
    description: "Authentication Context e claims challenge em ASP.NET Core com Microsoft Entra ID: autorização por risco, retomada do login e limites do CAE no exemplo TodoList."
---

:::lang{pt}

> Publicado originalmente no [Medium](https://medium.com/@pedro.soucheff/autentica%C3%A7%C3%A3o-baseada-em-contexto-e-cae-continuous-access-evaluation-em-aplica%C3%A7%C3%B5es-asp-net-core-7049015ea466) em 5 de janeiro de 2026.
>
> **Revisão técnica da republicação — 18 de outubro de 2026:** os exemplos foram corrigidos para encerrar a resposta ao iniciar um desafio interativo, exigir um novo envio das alterações após o login e preservar as verificações de existência e proprietário no exemplo de auditoria. Os exemplos também mantêm PII desabilitada nos logs por padrão. Foi delimitada a diferença entre Authentication Context, suporte a claims challenge e revogação por eventos de CAE. A publicação original permanece disponível no link acima.

![Autenticação baseada em contexto e CAE em aplicações ASP.NET Core](/images/articles/autenticacao-contexto-cae-aspnet-core/banner.png)

## Introdução

A segurança moderna não pode mais depender apenas de logins e senhas. Em um cenário onde ameaças evoluem diariamente e operações digitais carregam diferentes níveis de sensibilidade, as aplicações precisam ser capazes de **avaliar riscos em tempo real** e **ajustar automaticamente o nível de proteção necessário**. É exatamente isso que a **Autenticação Baseada em Contexto** e o **Continuous Access Evaluation (CAE)** oferecem: uma abordagem inteligente, adaptativa e profundamente alinhada às necessidades de segurança atuais.

Ao adotar esses mecanismos, sua aplicação ganha benefícios imediatos e tangíveis:

- **Segurança granular**, permitindo exigir níveis diferentes de autenticação conforme o risco da operação.
- **Proteção contínua em recursos compatíveis com CAE**, que podem deixar de aceitar tokens após eventos críticos, conforme suporte e latência de propagação do serviço.
- **Experiência de usuário equilibrada**, evitando desafios desnecessários e mantendo fluidez no uso diário.
- **Compliance facilitado**, atendendo requisitos regulatórios com controles precisos e auditáveis.
- **Eficiência operacional**, graças ao uso de tokens de longa duração sem comprometer a segurança.

Neste artigo, a aplicação ASP.NET Core demonstra Authentication Context e tratamento de claims challenge com Microsoft Entra ID. CAE fornece o contexto conceitual, mas a API TodoList mostrada não implementa recepção ou imposição de eventos de revogação.

## O que é Autenticação Baseada em Contexto

A **Autenticação Baseada em Contexto** (Authentication Context) é um recurso do Microsoft Entra ID que permite que APIs exijam que tokens de acesso contenham valores específicos de **ACR (Authentication Context Class Reference)** para autorizar ações sensíveis.

### Principais Conceitos:

- **ACR (Authentication Context Class Reference)**: Um claim (`acrs`) no token de acesso que indica o nível de garantia de autenticação que foi satisfeito
- **Níveis de Risco**: Valores personalizados (ex: `c10`, `c11`, `c12`) que representam diferentes níveis de sensibilidade de operações
- **Políticas de Acesso Condicional**: Regras configuradas no Entra ID que determinam quando e como os usuários devem ser desafiados (ex: MFA, dispositivo gerenciado, localização específica)

### Benefícios:

1. **Granularidade de segurança**: Diferentes operações podem exigir diferentes níveis de autenticação
2. **Proteção adaptativa**: A aplicação se adapta ao risco da operação
3. **Compliance**: Atende requisitos regulatórios que exigem autenticação forte para operações sensíveis
4. **Experiência do usuário equilibrada**: Usuários não são desafiados desnecessariamente para operações de baixo risco

## O que é CAE (Continuous Access Evaluation)

**CAE (Continuous Access Evaluation)** é um recurso que permite que eventos de segurança críticos sejam avaliados em tempo quase real, sem esperar a expiração do token de acesso.

### Eventos Críticos Avaliados:

1. **Revogação de sessão do usuário**
2. **Alteração de senha**
3. **Mudança de localização (risco de IP)**
4. **Desabilitação ou exclusão de conta**
5. **Mudanças em políticas de acesso condicional**

### Como Funciona:

- **Cliente compatível com claims challenge**: O cliente anuncia a capacidade `cp1`; o token emitido para a API pode refletir essa capacidade no claim `xms_cc`
- **Tokens de longa duração**: Sessões compatíveis com CAE podem receber tokens com validade de até 28 horas; isso não é uma garantia desta API customizada
- **Avaliação de eventos no recurso**: O serviço precisa receber e aplicar os eventos pertinentes. A documentação indica resposta próxima do tempo real, com possível latência de propagação
- **Claims Challenge**: A API retorna um desafio (WWW-Authenticate header) solicitando novo token

### Limites da demonstração

`xms_cc=cp1` anuncia suporte do cliente a claims challenge; ele não implementa revogação no servidor. Da mesma forma, validar `acrs` atende a um contexto de autenticação, mas não substitui autorização sobre o item solicitado.

O teste de `iat` abaixo é uma política local de idade do token. Ele não consulta a revogação de sessões, o estado da conta nem eventos do Entra. Um token recente ainda pode ser aceito pelo exemplo após um desses eventos. Solicitar outro token também não garante uma nova interação ou MFA: isso depende das políticas do provedor de identidade.

Os benefícios de CAE por eventos exigem suporte efetivo do recurso e do cliente. Consulte os [cenários e limitações oficiais de CAE](https://learn.microsoft.com/entra/identity/conditional-access/concept-continuous-access-evaluation) antes de assumir essas garantias em uma API própria.

## Arquitetura da Solução TodoList

A aplicação TodoList demonstra uma arquitetura típica de aplicação moderna com:

```text
┌─────────────────────┐         ┌─────────────────────┐
│                     │         │                     │
│  TodoList.Client    │ ──────> │   TodoList.API      │
│   (Web App MVC)     │  HTTPS  │   (Web API)         │
│                     │ <────── │                     │
└─────────────────────┘         └─────────────────────┘
         │                               │
         │                               │
         └───────────────┬───────────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │  Microsoft Entra ID │
              │    (Azure AD)       │
              └─────────────────────┘
```

### Modelo de Dados: TodoItem

Cada item da lista de tarefas possui um **RiskLevel** que determina o contexto de autenticação necessário:

```csharp
public class TodoListItem
{
    public int Id { get; set; }
    public string? Title { get; set; }
    public string? Owner { get; set; }
    public string? RiskLevel { get; set; }  // c10, c11, c12
}
```

### Níveis de Risco Definidos

```csharp
public static class AuthenticationContext
{
    public const string authenticationContextClassReferencesClaim = "acrs";
    public const string clientCapabilitiesClaim = "xms_cc";
    public const string LowRisk = "c10";      // Baixo risco
    public const string MediumRisk = "c11";   // Médio risco
    public const string HighRisk = "c12";     // Alto risco
}
```

## Implementação no Cliente (TodoList.Client)

### 1. Configuração da Autenticação

O cliente web precisa ser configurado para suportar autenticação do Microsoft Entra ID, aquisição de tokens e tratamento de desafios de claims.

#### Program.cs — Configuração de Serviços

```csharp
void ConfigureServices(IServiceCollection services, IConfiguration configuration)
{
    services.AddControllersWithViews(options =>
    {
        var policy = new AuthorizationPolicyBuilder()
            .RequireAuthenticatedUser()
            .Build();
        options.Filters.Add(new AuthorizeFilter(policy));
    }).AddMicrosoftIdentityUI();
    
    services.AddDistributedMemoryCache();
    
    // Configuração de autenticação
    services.AddAuthentication(OpenIdConnectDefaults.AuthenticationScheme)
        .AddMicrosoftIdentityWebApp(configuration.GetSection("AzureAD"))
        .EnableTokenAcquisitionToCallDownstreamApi()
        .AddInMemoryTokenCaches();
    
    services.AddAuthorization(options =>
    {
        options.FallbackPolicy = new AuthorizationPolicyBuilder()
            .RequireAuthenticatedUser()
            .Build();
    });
    
    // Habilita chamadas para API downstream
    services.AddDownstreamApi("TodoList", configuration.GetSection("TodoList"));
    
    // ⭐ COMPONENTE ESSENCIAL PARA CAE E AUTENTICAÇÃO BASEADA EM CONTEXTO
    services.AddScoped<MicrosoftIdentityConsentAndConditionalAccessHandler>();
}
```

**Pontos-chave:**

- `AddMicrosoftIdentityWebApp`: Configura autenticação OpenID Connect com Entra ID
- `EnableTokenAcquisitionToCallDownstreamApi`: Habilita aquisição de tokens para APIs
- `AddDownstreamApi`: Registra a API TodoList como serviço downstream
- `MicrosoftIdentityConsentAndConditionalAccessHandler`: **Componente crucial** que gerencia consentimentos e desafios de acesso condicional

### 2. Controller do Cliente — Tratamento de Claims Challenge

#### TodoListController.cs — Inicialização

```csharp
public class TodoListController : Controller
{
    private IDownstreamApi _downstreamApi;
    private readonly MicrosoftIdentityConsentAndConditionalAccessHandler _consentHandler;
    private readonly ITokenAcquisition _tokenAcquisition;
    private string _owner = String.Empty;
    private readonly IConfiguration _configuration;

    public TodoListController(
        IDownstreamApi downstreamApi,
        MicrosoftIdentityConsentAndConditionalAccessHandler consentHandler,
        ITokenAcquisition tokenAcquisition,
        IConfiguration configuration)
    {
        _downstreamApi = downstreamApi;
        _consentHandler = consentHandler;
        _tokenAcquisition = tokenAcquisition;
        _configuration = configuration;
        _owner = consentHandler.User.Claims
            .FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value 
            ?? String.Empty;
    }
}
```

#### Operação de Leitura com Tratamento de Claims Challenge

```csharp
// GET: TodoList/Details/5
public async Task<ActionResult> Details(int id)
{
    try
    {
        TodoListItem item = await _downstreamApi.GetForUserAsync<TodoListItem>(
            "TodoList",
            options => options.RelativePath = $"api/todolist/{id}");
        return View(item);
    }
    catch (MicrosoftIdentityWebChallengeUserException ex)
    {
        // ⭐ Esta exceção contém o desafio de claims do header WWW-Authenticate da API
        
        // Extrair o desafio de claims da exceção interna
        string? claimsChallenge = null;
        
        if (ex.InnerException is MsalUiRequiredException msalException)
        {
            claimsChallenge = msalException.Claims;
        }
        
        // ⭐ Desafiar o usuário com escopos e claims necessários
        _consentHandler.ChallengeUser(ex.Scopes, claimsChallenge);
        return new EmptyResult();
    }
}
```

**O que acontece aqui:**

1. Cliente tenta acessar um item da TodoList
2. API valida o token e detecta que falta o contexto de autenticação necessário
3. API retorna `401 Unauthorized` com header `WWW-Authenticate` contendo o desafio de claims
4. Cliente captura a exceção `MicrosoftIdentityWebChallengeUserException`
5. Extrai o desafio de claims da exceção interna (`MsalUiRequiredException`)
6. Usa `_consentHandler.ChallengeUser()` para redirecionar o usuário ao Entra ID
7. Usuário completa a autenticação adicional (ex: MFA)
8. Novo token é emitido com o claim `acrs` necessário
9. A resposta que iniciou o desafio é encerrada; a leitura só é retomada em uma nova requisição após a autenticação

#### Operação de Atualização com Claims Challenge

```csharp
// POST: TodoList/Edit/5
[HttpPost]
[ValidateAntiForgeryToken]
public async Task<ActionResult> Update(int id, [Bind("Id,Title,Owner,RiskLevel")] TodoListItem? item)
{
    try
    {
        await _downstreamApi.CallApiForUserAsync<TodoListItem, TodoListItem>(
            "TodoList", item,
            options => 
            { 
                options.RelativePath = $"api/todolist/{id}"; 
                options.HttpMethod = HttpMethod.Patch.ToString(); 
            });
        return RedirectToAction("Index");
    }
    catch (MicrosoftIdentityWebChallengeUserException ex)
    {
        // Extrair claims challenge
        string? claimsChallenge = null;
        if (ex.InnerException is MsalUiRequiredException msalException)
        {
            claimsChallenge = msalException.Claims;
        }

        // Retornar a uma tela GET, sem repetir a mutação durante o desafio.
        var returnUri = Url.Action("Edit", "TodoList", new { id })
            ?? throw new InvalidOperationException("A rota GET TodoList/Edit deve estar configurada.");

        return RedirectToAction("Challenge", "Account", new
        {
            area = "MicrosoftIdentity",
            redirectUri = returnUri,
            scope = ex.Scopes is null ? null : string.Join(" ", ex.Scopes),
            claims = claimsChallenge
        });
    }
}
```

**Reenvio da alteração:** este fluxo pressupõe uma ação **GET `TodoList/Edit`** para reabrir o formulário depois do login. Os valores enviados no POST não são persistidos por este trecho: o usuário deve reinformar ou confirmar as alterações e fazer um novo envio com antiforgery. Se o produto precisar preservar um rascunho, armazene-o no servidor, vinculado ao usuário e com expiração, e valide novamente a autorização antes de aplicá-lo. Não transporte os dados do formulário na URL nem reproduza automaticamente uma mutação.

`MicrosoftIdentity/Account/Challenge` é disponibilizado por `AddMicrosoftIdentityUI()`; seus parâmetros `redirectUri`, `scope` e `claims` estão documentados em [AccountController.Challenge](https://learn.microsoft.com/dotnet/api/microsoft.identity.web.ui.areas.microsoftidentity.controllers.accountcontroller.challenge). O `redirectUri` acima é gerado pela aplicação, não recebido diretamente do usuário.

## Implementação na API (TodoList.API)

### 1. Configuração da API

#### Program.cs — Configuração de Autenticação

```csharp
void ConfigureServices(IServiceCollection services, IConfiguration configuration)
{
    services.AddControllers();
    services.AddOpenApi();
    
    // Não expor PII nos logs por padrão.
    IdentityModelEventSource.ShowPII = false;
    
    // ⭐ Desabilita mapeamento de claims para preservar claims originais do token
    JwtSecurityTokenHandler.DefaultMapInboundClaims = false;
    
    // ⭐ Configura autenticação de API com Microsoft Identity
    services.AddMicrosoftIdentityWebApiAuthentication(configuration);
}
```

### 2. Controller da API — Validação de Contexto de Autenticação

#### TodoListController.cs — Verificação de Client Capabilities

```csharp
public bool IsClientCapableofClaimsChallenge(ClaimsPrincipal context)
{
    // ⭐ Verifica se o cliente anuncia suporte a claims challenge.
    Claim? ccClaim = context.Claims.FirstOrDefault(
        x => x.Type == AuthenticationContext.clientCapabilitiesClaim);
    
    if (ccClaim != null && ccClaim.Value == "cp1")
    {
        return true;
    }
    return false;
}
```

**Explicação:**

- O claim `xms_cc` (client capabilities) com valor `cp1` indica suporte do cliente a claims challenge, não imposição de eventos de CAE pela API
- Configure `ClientCapabilities` com `cp1` no cliente e o claim opcional `xms_cc` no recurso, conforme a [documentação de client capabilities](https://learn.microsoft.com/entra/identity-platform/claims-challenge#client-capabilities); não presuma que todo token incluirá esse claim
- Nesta demonstração, a API exige essa capacidade para as operações protegidas por contexto

#### Método Central: CheckForRequiredAuthContext

Este é o **coração da autenticação baseada em contexto**:

```csharp
public IActionResult? CheckForRequiredAuthContext(ClaimsPrincipal claimsPrincipal, string RiskLevel)
{
    // 1️⃣ Verificar se já existe o claim ACRS necessário no token
    Claim? acrsClaim = claimsPrincipal.Claims.FirstOrDefault(
        x => x.Type == AuthenticationContext.authenticationContextClassReferencesClaim 
        && x.Value == RiskLevel);
    
    // 2️⃣ Verificar se o cliente anuncia suporte a claims challenge.
    if (!IsClientCapableofClaimsChallenge(claimsPrincipal))
    {
        throw new UnauthorizedAccessException(
            "The caller does not meet the authentication bar to carry out this operation. " +
            "The service cannot allow this operation");
    }
    
    // 3️⃣ Verificar idade do token (freshness check)
    Claim? iatClaim = claimsPrincipal.Claims.FirstOrDefault(x => x.Type == "iat");
    if (iatClaim != null && long.TryParse(iatClaim.Value, out long issuedAt))
    {
        var tokenIssuedTime = DateTimeOffset.FromUnixTimeSeconds(issuedAt);
        var currentTime = DateTimeOffset.UtcNow;
        var timeDifference = currentTime - tokenIssuedTime;
        
        // ⭐ Token com mais de 15 minutos requer reautenticaçã, pode ser definidooutros fatores como mudança de IP
        if (timeDifference.TotalMinutes > 15)
        {
            string clientId = _configuration
                .GetSection("AzureAd")
                .GetSection("ClientId").Value ?? string.Empty;
            // Construir o claims challenge
            var claimsDict = new Dictionary<string, object>
            {
                ["access_token"] = new Dictionary<string, object>
                {
                    ["acrs"] = new Dictionary<string, object>
                    {
                        ["essential"] = true,
                        ["value"] = RiskLevel
                    }
                }
            };
            string claimsJson = JsonSerializer.Serialize(claimsDict);
            string base64Claims = Convert.ToBase64String(Encoding.UTF8.GetBytes(claimsJson));
            // ⭐ Construir header WWW-Authenticate
            var authHeaderParams = new Dictionary<string, string>
            {
                ["realm"] = "",
                ["authorization_uri"] = "https://login.microsoftonline.com/common/oauth2/authorize",
                ["client_id"] = clientId,
                ["error"] = "insufficient_claims",
                ["claims"] = base64Claims,
                ["cc_type"] = "authcontext"
            };
            var wwwAuthenticateHeader = "Bearer " + string.Join(", ", 
                authHeaderParams.Select(kvp => $"{kvp.Key}=\"{kvp.Value}\""));
            HttpContext.Response.Headers.Append("WWW-Authenticate", wwwAuthenticateHeader);
            return new UnauthorizedObjectResult(
                "The access token is too old. Please authenticate again with a fresh token.");
        }
    }
    
    // 4️⃣ Se o claim ACRS já existe, permitir acesso
    if (acrsClaim != null)
    {
        return null;  // Autorizado!
    }
    else
    {
        
        // 5️⃣ Claim ACRS não existe - retornar claims challenge
        string clientId = _configuration
            .GetSection("AzureAd")
            .GetSection("ClientId").Value ?? string.Empty;
        var claimsDict = new Dictionary<string, object>
        {
            ["access_token"] = new Dictionary<string, object>
            {
                ["acrs"] = new Dictionary<string, object>
                {
                    ["essential"] = true,
                    ["value"] = RiskLevel
                }
            }
        };
        string claimsJson = JsonSerializer.Serialize(claimsDict);
        string base64Claims = Convert.ToBase64String(Encoding.UTF8.GetBytes(claimsJson));
        var authHeaderParams = new Dictionary<string, string>
        {
            ["realm"] = "",
            ["authorization_uri"] = "https://login.microsoftonline.com/common/oauth2/authorize",
            ["client_id"] = clientId,
            ["error"] = "insufficient_claims",
            ["claims"] = base64Claims,
            ["cc_type"] = "authcontext"
        };
        var wwwAuthenticateHeader = "Bearer " + string.Join(", ", 
            authHeaderParams.Select(kvp => $"{kvp.Key}=\"{kvp.Value}\""));
        HttpContext.Response.Headers.Append("WWW-Authenticate", wwwAuthenticateHeader);
        var result = new UnauthorizedObjectResult(
            "The presented access tokens had insufficient claims. " +
            "Please request for claims requested in the WWW-Authentication header and try again.");
        return result;
    }
}
```

**Fluxo de Validação:**

1. **Verificação de ACRS**: Checa se o token já contém o claim `acrs` com o valor de risco necessário
2. **Verificação de Capacidade do Cliente**: Confere o anúncio de suporte a claims challenge (`xms_cc=cp1`), sem atestar revogação por eventos
3. **Verificação de Freshness**: Verifica se o token foi emitido há menos de 15 minutos
4. **Autorização ou Challenge**: Se tudo OK, autoriza; caso contrário, retorna claims challenge

#### Uso em Endpoints da API

```csharp
// GET: api/todolist/{id}
[HttpGet("{id}", Name = "Get")]
[RequiredScope(AcceptedScope = new string[] 
    { Scopes.ToDoListRead, Scopes.ToDoListReadWrite })]
public IActionResult Get(int id)
{
    if (!TodoStore.ContainsKey(id) || TodoStore[id].Owner != _currentPrincipalId)
    {
        return NotFound();
    }
    
    TodoListItem item = TodoStore[id];
    
    // ⭐ Verificar contexto de autenticação baseado no RiskLevel do item
    var authCheckResult = CheckForRequiredAuthContext(
        _currentClaimsPrincipal!, 
        item.RiskLevel!);
    
    if (authCheckResult != null)
    {
        return authCheckResult;  // Retorna 401 com claims challenge
    }
    return Ok(item);  // Autorizado!
}
```

```csharp
// PATCH: api/todolist/{id}
[HttpPatch("{id}")]
[RequiredScope(AcceptedScope = new string[] { Scopes.ToDoListReadWrite })]
public IActionResult Patch(int id, [FromBody] TodoListItem updatedItem)
{
    if (!TodoStore.ContainsKey(id) || TodoStore[id].Owner != _currentPrincipalId)
    {
        return NotFound();
    }

    TodoListItem item = TodoStore[id];
    // ⭐ Verificar contexto antes de permitir atualização
    var authCheckResult = CheckForRequiredAuthContext(
        _currentClaimsPrincipal!, 
        item.RiskLevel!);
    
    if (authCheckResult != null)
    {
        return authCheckResult;
    }
    item.Title = updatedItem.Title;
    item.RiskLevel = updatedItem.RiskLevel;
    return Ok();
}
```

```csharp
// DELETE: api/todolist/{id}
[HttpDelete("{id}")]
[RequiredScope(AcceptedScope = new string[] { Scopes.ToDoListReadWrite })]
public IActionResult Delete(int id)
{
    if (!TodoStore.ContainsKey(id) || TodoStore[id].Owner != _currentPrincipalId)
    {
        return NotFound();
    }
  
    TodoListItem item = TodoStore[id];
    
    // ⭐ Verificar contexto antes de permitir exclusão
    var authCheckResult = CheckForRequiredAuthContext(
        _currentClaimsPrincipal!, 
        item.RiskLevel!);
    
    if (authCheckResult != null)
    {
        return authCheckResult;
    }
    
    TodoStore.Remove(id);
    return Ok();
}
```

## Fluxo de Autenticação Baseada em Contexto

### Cenário: Usuário tenta acessar um TodoItem de alto risco

```text
┌────────────┐                ┌──────────────┐                ┌──────────────┐
│   Client   │                │     API      │                │  Entra ID    │
└─────┬──────┘                └──────┬───────┘                └──────┬───────┘
      │                              │                               │
      │ 1. GET /api/todolist/4       │                               │
      │ Bearer: token_sem_acrs ─────>│                               │
      │                              │                               │
      │                              │ 2. Valida token               │
      │                              │    - Scopes: OK ✓             │
      │                              │    - Item RiskLevel: c12      │
      │                              │    - Token acrs: ❌ (ausente) │
      │                              │    - xms_cc: cp1 ✓            │
      │                              │                               │
      │ 3. 401 Unauthorized          │                               │
      │    WWW-Authenticate:         │                               │
      │    Bearer error="insufficient_claims",│                       │
      │    claims="base64(...)"      │                               │
      │ <────────────────────────────│                               │
      │                              │                               │
      │ 4. Detecta claims challenge  │                               │
      │    Extrai claims necessários │                               │
      │                              │                               │
      │ 5. Redireciona usuário       │                               │
      │    para autenticação ────────┼──────────────────────────────>│
      │                              │                               │
      │                              │      6. Avalia política CAC   │
      │                              │         - Requer MFA          │
      │                              │         - Dispositivo gerenc. │
      │                              │                               │
      │ 7. Usuário completa MFA      │                               │
      │ <─────────────────────────────────────────────────────────────│
      │                              │                               │
      │ 8. Novo token com acrs=c12   │                               │
      │ <─────────────────────────────────────────────────────────────│
      │                              │                               │
      │ 9. Retry: GET /api/todolist/4│                               │
      │ Bearer: token_com_acrs ──────>│                               │
      │                              │                               │
      │                              │ 10. Valida token              │
      │                              │     - Scopes: OK ✓            │
      │                              │     - acrs: c12 ✓             │
      │                              │     - Autorizado!             │
      │                              │                               │
      │ 11. 200 OK + TodoItem        │                               │
      │ <────────────────────────────│                               │
      │                              │                               │
```

## Níveis de Risco e Políticas de Acesso Condicional

### Mapeamento de Níveis de Risco

![Mapeamento dos níveis de risco e contextos de autenticação](/images/articles/autenticacao-contexto-cae-aspnet-core/risk-levels.png)

### Exemplo de Dados de Teste

No código da API, vemos dados de exemplo com diferentes níveis de risco:

```csharp
// Pre-populate with sample data
if (TodoStore.Count == 0 && !string.IsNullOrEmpty(_currentPrincipalId))
{
    TodoStore.Add(1, new TodoListItem() 
    { 
        Id = 1, 
        Owner = $"{_currentPrincipalId}", 
        Title = "Pick up groceries", 
        RiskLevel = "c10"  // ⭐ Baixo risco
    });
    
    TodoStore.Add(2, new TodoListItem() 
    { 
        Id = 2, 
        Owner = $"{_currentPrincipalId}", 
        Title = "Low report", 
        RiskLevel = "c10"  // ⭐ Baixo risco
    });
    
    TodoStore.Add(3, new TodoListItem() 
    { 
        Id = 3, 
        Owner = $"{_currentPrincipalId}", 
        Title = "Medium report", 
        RiskLevel = "c11"  // ⭐ Médio risco - requer autenticação resistente a phishing
    });
    
    TodoStore.Add(4, new TodoListItem() 
    { 
        Id = 4, 
        Owner = $"{_currentPrincipalId}", 
        Title = "High report", 
        RiskLevel = "c12"  // ⭐ Alto risco - requer autorização via Entra ID Governance - Entitlement Management + Autenticação resistente a phishing
    });
}
```

### Configuração de Políticas no Entra ID

Para que a autenticação baseada em contexto funcione, você deve configurar **Políticas de Acesso Condicional** no Microsoft Entra ID:

**Política para c10 (Baixo Risco)**:

- **Condição**: Authentication context = `c10`
- **Política de acesso**: Exigir autenticação multifator

![Configuração de contextos de autenticação e políticas de Acesso Condicional no Entra ID, etapa 1](/images/articles/autenticacao-contexto-cae-aspnet-core/entra-config-01.png)

![Configuração de contextos de autenticação e políticas de Acesso Condicional no Entra ID, etapa 2](/images/articles/autenticacao-contexto-cae-aspnet-core/entra-config-02.png)

![Configuração de contextos de autenticação e políticas de Acesso Condicional no Entra ID, etapa 3](/images/articles/autenticacao-contexto-cae-aspnet-core/entra-config-03.png)

**Política para c11 (Médio Risco)**:

- **Condição**: Authentication context = `c11`
- **Política de acesso**: Exigir autenticação resitente

![Configuração de contextos de autenticação e políticas de Acesso Condicional no Entra ID, etapa 4](/images/articles/autenticacao-contexto-cae-aspnet-core/entra-config-04.png)

![Configuração de contextos de autenticação e políticas de Acesso Condicional no Entra ID, etapa 5](/images/articles/autenticacao-contexto-cae-aspnet-core/entra-config-05.png)

**Política para c12 (Alto Risco)**:

- **Condição**: Authentication context = `c12`
- **Política de acesso**:
- Exigir autenticação resistente a phishing
- Bloqueio em caso de alto risco de usuário
- Autorização via Entra ID Governance por meio do entitlemente management, no caso foi exigido verificação facial.

**Conditional Access**

![Configuração de contextos de autenticação e políticas de Acesso Condicional no Entra ID, etapa 6](/images/articles/autenticacao-contexto-cae-aspnet-core/entra-config-06.png)

![Configuração de contextos de autenticação e políticas de Acesso Condicional no Entra ID, etapa 7](/images/articles/autenticacao-contexto-cae-aspnet-core/entra-config-07.png)

![Configuração de contextos de autenticação e políticas de Acesso Condicional no Entra ID, etapa 8](/images/articles/autenticacao-contexto-cae-aspnet-core/entra-config-08.png)

**Entra ID Governance**

![Pacote de acesso Todo List – High Access Exception no Microsoft Entra ID Governance](/images/articles/autenticacao-contexto-cae-aspnet-core/entra-config-09.png)

![Política do pacote de acesso com aprovação, Verified ID e expiração de uma hora](/images/articles/autenticacao-contexto-cae-aspnet-core/entra-config-10.png)

## Tratamento de Desafios de Claims (Claims Challenge)

### Anatomia de um WWW-Authenticate Header

Quando a API detecta que falta o contexto de autenticação necessário, ela retorna:

```http
HTTP/1.1 401 Unauthorized
WWW-Authenticate: Bearer realm="", 
                  authorization_uri="https://login.microsoftonline.com/common/oauth2/authorize", 
                  client_id="<client-id>", 
                  error="insufficient_claims", 
                  claims="eyJhY2Nlc3NfdG9rZW4iOnsiYWNycyI6eyJlc3NlbnRpYWwiOnRydWUsInZhbHVlIjoiYzEyIn19fQ==",
                  cc_type="authcontext"
```

### Decodificação do Claims Challenge

O parâmetro `claims` é uma string Base64 que, quando decodificada, contém:

```json
{
  "access_token": {
    "acrs": {
      "essential": true,
      "value": "c12"
    }
  }
}
```

**Significado:**

- `access_token`: O claim deve estar no token de acesso (não no ID token)
- `acrs`: Claim de Authentication Context Class Reference
- `essential: true`: Este claim é obrigatório
- `value: "c12"`: O valor específico de ACR necessário

### Fluxo de Tratamento no Cliente

```csharp
try
{
    // Tentar operação
    var result = await _downstreamApi.GetForUserAsync<TodoListItem>(...);
}
catch (MicrosoftIdentityWebChallengeUserException ex)
{
    // 1️⃣ API retornou 401 com claims challenge
    
    // 2️⃣ Extrair o claims challenge da exceção interna
    string? claimsChallenge = null;
    if (ex.InnerException is MsalUiRequiredException msalException)
    {
        claimsChallenge = msalException.Claims;
        // claimsChallenge contém o JSON decodificado automaticamente
    }
    
    // 3️⃣ Usar o ConsentHandler para desafiar o usuário
    _consentHandler.ChallengeUser(
        ex.Scopes,           // Scopes necessários
        claimsChallenge      // Claims adicionais necessários
    );
    
    // 4️⃣ Encerrar a resposta. A leitura será retomada em outra requisição.
    return new EmptyResult();
}
```

### O que acontece no `ChallengeUser()`

O método `ChallengeUser()` do `MicrosoftIdentityConsentAndConditionalAccessHandler`:

1. Armazena os claims necessários
2. Inicia um novo fluxo de autenticação OpenID Connect
3. Inclui o parâmetro `claims` no pedido de autorização
4. Entra ID avalia as políticas de acesso condicional correspondentes ao ACR solicitado
5. Usuário completa os requisitos (ex: MFA, dispositivo gerenciado)
6. Novo token é emitido com o claim `acrs` incluído
7. Uma nova requisição pode usar o token adquirido; a requisição que iniciou o desafio não continua aguardando o login

Para leituras, encerre a resposta com `EmptyResult` depois de chamar o handler, como no [exemplo oficial de Authentication Context](https://learn.microsoft.com/entra/identity-platform/developer-guide-conditional-access-authentication-context#integration-steps). Para alterações, use uma URL de retorno GET e um novo envio explícito, como no exemplo de atualização.

## Melhores Práticas

### 1. Segurança

✅ **FAZER:**

- Verificar `xms_cc=cp1` quando o contrato da API exigir suporte a claims challenge, sem tratá-lo como prova de revogação por eventos
- Implementar verificação do token para operações sensíveis, como freshness, mudança de localidade
- Usar diferentes níveis de ACR para diferentes níveis de sensibilidade de dados
- Configurar políticas de acesso condicional alinhadas aos níveis de ACR
- Desabilitar `DefaultMapInboundClaims` para preservar claims originais

❌ **NÃO FAZER:**

- Nunca assumir que um token antigo é seguro sem verificação
- Não expor `ShowPII = true` em produção
- Não confiar apenas em scopes OAuth para operações de alto risco
- Não permitir operações sensíveis sem verificar capacidade CAE do cliente

### 2. Experiência do Usuário

✅ **FAZER:**

- Retomar leituras em uma nova requisição após a autenticação e solicitar confirmação para reenviar alterações
- Fornecer mensagens de erro claras quando a autenticação falha
- Usar níveis de risco apropriados (não exigir MFA para tudo)
- Considerar cache de tokens com CAE para reduzir prompts

❌ **NÃO FAZER:**

- Não desafiar usuários repetidamente para a mesma operação
- Não implementar loops infinitos de retry
- Não exigir reautenticação frequente para operações de baixo risco

### 3. Tratamento de Erros

✅ **FAZER:**

- Capturar `MicrosoftIdentityWebChallengeUserException` especificamente
- Extrair claims challenge de `MsalUiRequiredException` interna
- Logar tentativas de acesso negado para auditoria
- Implementar fallback para clientes não-CAE quando apropriado

```csharp
catch (MicrosoftIdentityWebChallengeUserException ex)
{
    Console.WriteLine($"Claims challenge received: {ex.Message}");
    
    string? claimsChallenge = null;
    if (ex.InnerException is MsalUiRequiredException msalException)
    {
        claimsChallenge = msalException.Claims;
        Console.WriteLine($"Required claims: {claimsChallenge}");
    }
    
    _consentHandler.ChallengeUser(ex.Scopes, claimsChallenge);
    return new EmptyResult();
}
catch (HttpRequestException httpEx)
{
    Console.WriteLine($"HTTP error: {httpEx.StatusCode} - {httpEx.Message}");
    // Tratar erros de rede
}
catch (Exception ex)
{
    Console.WriteLine($"Unexpected error: {ex.Message}");
    // Tratar erros genéricos
}
```

### 4. Performance e Cache

✅ **FAZER:**

- Usar cache de tokens em memória (`AddInMemoryTokenCaches()`)
- Considerar cache distribuído para aplicações web em escala
- Usar tokens de longa duração somente nos cenários compatíveis com CAE; não assumir revogação por eventos nesta API customizada
- Reutilizar tokens válidos sempre que possível

### 5. Compliance e Auditoria

✅ **FAZER:**

- Registrar todas as tentativas de acesso a operações sensíveis
- Incluir contexto de autenticação nos logs de auditoria
- Monitorar falhas de autenticação e padrões anômalos
- Documentar mapeamento entre níveis de ACR e requisitos de compliance

O exemplo abaixo substitui o GET anterior, mantendo os escopos e a autorização por proprietário antes de registrar ou retornar dados do item.

```csharp
[HttpGet("{id}", Name = "Get")]
[RequiredScope(AcceptedScope = new string[]
    { Scopes.ToDoListRead, Scopes.ToDoListReadWrite })]
public IActionResult Get(int id)
{
    if (!TodoStore.TryGetValue(id, out var item) || item.Owner != _currentPrincipalId)
    {
        _logger.LogWarning(
            "TodoItem {ItemId} unavailable for User {UserId}",
            id, _currentPrincipalId);
        return NotFound();
    }
    
    // Proprietário já verificado; auditar antes de conferir o contexto.
    _logger.LogInformation(
        "User {UserId} attempting to access TodoItem {ItemId} with RiskLevel {RiskLevel}",
        _currentPrincipalId, id, item.RiskLevel);
    
    var authCheckResult = CheckForRequiredAuthContext(
        _currentClaimsPrincipal!, 
        item.RiskLevel!);
    
    if (authCheckResult != null)
    {
        _logger.LogWarning(
            "Access denied for User {UserId} to TodoItem {ItemId} - insufficient auth context",
            _currentPrincipalId, id);
        return authCheckResult;
    }
    
    _logger.LogInformation(
        "Access granted for User {UserId} to TodoItem {ItemId}",
        _currentPrincipalId, id);
    
    return Ok(item);
}
```

## Conclusão

A demonstração implementa **Authentication Context**, claims challenge e uma política local de idade do token. Esses mecanismos podem participar de uma arquitetura com **CAE**, mas o exemplo não recebe nem aplica eventos de revogação de conta ou sessão.

### Benefícios e limites:

1. **Segurança Adaptativa**: Diferentes operações exigem diferentes níveis de garantia de autenticação
2. **Revogação por eventos**: É um benefício de recursos efetivamente compatíveis com CAE, não entregue pela checagem de `iat`, `acrs` e `cp1` desta amostra
3. **Retomada da operação**: Leituras podem ser refeitas após o login; alterações exigem novo envio e nova autorização
4. **Compliance Facilitado**: Atende requisitos regulatórios com controles granulares
5. **Tokens de Longa Duração**: Dependem do suporte do cliente e do recurso; não substituem as verificações de autorização da API

### Componentes-Chave da Implementação:

**No Cliente (TodoList.Client):**

- `MicrosoftIdentityConsentAndConditionalAccessHandler` para gerenciar desafios
- Tratamento robusto de `MicrosoftIdentityWebChallengeUserException`
- Extração de claims challenge de `MsalUiRequiredException`
- Retomada de leituras em nova requisição e reenvio explícito das alterações

**Na API (TodoList.API):**

- Verificação de `xms_cc=cp1` para conferir suporte a claims challenge
- Validação de claim `acrs` baseado no nível de risco da operação
- Verificação de freshness do token, podendo ser por tempo ou outros elementos.
- Construção correta de header `WWW-Authenticate` com claims challenge

### Cenários de Uso Recomendados:

- ✅ Aplicações financeiras com diferentes níveis de transações
- ✅ Sistemas de saúde com acesso a dados sensíveis
- ✅ Plataformas corporativas com múltiplos níveis de confidencialidade
- ✅ Aplicações governamentais com requisitos de compliance rigorosos
- ✅ Qualquer API que precise de controle granular de acesso

### Próximos Passos:

1. Configurar Authentication Contexts no portal do Microsoft Entra ID
2. Criar Políticas de Acesso Condicional mapeadas aos contexts
3. Implementar níveis de risco apropriados ao seu domínio de negócio
4. Testar fluxos com diferentes contextos e políticas
5. Implementar logging e auditoria robustos
6. Monitorar métricas de segurança e experiência do usuário
7. Criação de um motor de avaliação de risco para atribuição dinâmica de contexto

### Recursos Adicionais:

- [Microsoft Entra Conditional Access](https://learn.microsoft.com/entra/identity/conditional-access/)
- [Continuous Access Evaluation](https://learn.microsoft.com/entra/identity/conditional-access/concept-continuous-access-evaluation)
- [Authentication Context](https://learn.microsoft.com/entra/identity/conditional-access/concept-conditional-access-cloud-apps#authentication-context)
- [Microsoft Identity Web Library](https://github.com/AzureAD/microsoft-identity-web)

**Autor:** Pedro Soucheff
**Metadados do texto original no Medium:** última atualização em dezembro de 2025, versão 1.1.
**Revisão técnica desta republicação:** 18 de outubro de 2026, com as correções descritas no início do artigo.

:::
