# OAuth/OpenID Connect - Autorização e Autenticação: conceitos e aplicações na plataforma Entra ID

**Note:** Esse artigo faz part de uma série artigos que irá abordar os conceitos e funcionalidades da plataforma Entra: Entra ID, Entra ID Protection, Entra ID Governance,Global Secure Access, Entra Permission Management


## Introdução
A internet é um espaço de interação e troca de informações entre diversos agentes, como usuários, aplicativos, serviços e recursos. Para garantir a segurança e a privacidade dessas interações, é necessário estabelecer mecanismos de autenticação e autorização que verifiquem a identidade e o acesso dos agentes envolvidos. Os protocolos modernos mais utilizados para esse fim são o **OpenID Connect(OIDC)**, **Open Authentication(OAuth)** e **Security Assertion Markup Language(SAML)**. Esses protocolos objetivam permitir que um aplicativo obtenha acesso limitado a um recurso protegido em nome de um usuário, sem que este tenha que compartilhar suas credenciais com o aplicativo.

O objetivo deste artigo é apresentar os conceitos e as aplicações dos protocolos **OAuth** e **OIDC** usando como IAM o **Entra ID**, explicando como eles operam, quais são os seus benefícios e desafios, e como eles podem ser implementados em diferentes cenários. A tese defendida neste artigo é que o **OAuth** e o **OIDC** são protocolos flexíveis, seguros e eficientes para a gestão de autenticação e autorização na internet, mas que também requerem cuidados e boas práticas para evitar vulnerabilidades e riscos.

O artigo será divido em 6 seções:
* Seção 1, será feita uma revisão teórica sobre os conceitos de autenticação e autorização, bem como sobre o histórico e a evolução do **protocolo de autenticação e autorização**. 
* Seção 2, será descrito o funcionamento do **OAuth**, explicando os seus principais componentes, fluxos e especificações.
* Seção 3, será descrito o funcionamento do **OpenID Connect**, explicando os seus principais componentes, fluxos e especificações.
* Seção 4, serão apresentados alguns exemplos de aplicações usando **OAuth** e **OIDC** em diferentes contextos, como redes sociais, serviços de nuvem e dispositivos móveis.
* Seção 5, serão discutidos os benefícios e os desafios do **OAuth** e **OIDC**, analisando as suas vantagens e desvantagens, bem como as suas recomendações e limitações.
* Seção 6, serão feitas as considerações finais e as sugestões para trabalhos futuros.


## Seção 1 - Revisão teória e conceitos de autenticação e autorização e sua evolução

>Termos: 
> * Authentication => AuthN
> * Authrorization => AuthZ
> * Identity Access Manegament => IAM
> * Identity Provider => IdP
> * Service Provider => SP
> * Single Sign-On => SSO

### Conceitos basico

#### Autenticação e Autorização
A Autenticação(AuthN) é o processo de identitificar o agente, ou seja responder a perguntar "Who are you?".

Já o processo de Autorização(AuthZ) é a validação se o agente tem da permissão de acesso aos recursos solicitados, "Can you do that?".

#### Autenticação moderna
A autenticação moderna é realizada por um IdP qual irá realizar a correta identificação do usuário e irá emitir tokens para a aplicação de maneira que a aplicação não precise a coleta por exemplo de login e senha do 
usuário para que realize a autenticação e autorização.

Esse metodo de autenticação além de possibilitar uma segurança maior no processo, centralização da identidade, facilita a integração com outras aplicações(desde que falem os protocolos modernos) e implementações de novos metodos de autenticação sem a necessidade de alteração das aplicações

### SAML 2.0

**Security Assertion Markup Language (SAML)** é um dos metódos modernos de autenticação qual permite que o usuário realize o login em diversas aplicações utilizando a mesma credencial.

1. **O que é o SAML?**
    - **SAML** é um protocolo utilizado entre o IDP e o SP de maneira a realizar a autenticação e a autorização do usuário nas aplicações.
    - Esse protocolo possibilita o uso do SSO de maneira a permitir que o usuário reutilize sua sessão com o IdP para autenticar em diversas aplicação evitando a necessidade de realizar multiplas autenticações.
    - A versão mais atual e utilizada é a **SAML 2.0** com a última atualização em 17 de janeiro de 2019.
    - Mantido pela [OASIS](https://wiki.oasis-open.org/security/FrontPage)

2. **Exemplo de fluxo no Entra ID**
    - Fluxo de autenticação SAML com Entra ID

    ![Flow Saml](./images/saml-auth.png)

3. **Caracteristicas**
   - O **SAML** é um procotocolo baseado em XML.
   - O token será conduzido sempre na camada de front-channel
   - Possibilidade do uso do encryption token
   - Aceita IdP Initiate e SP Initiate
   - Trabalha com SAML metadata para configurações do IdP e do SP

4. **Exemplo do Token**
    - AuthN Request no caso do SP Initiated

    - AuthN Response

### OAuth 2.0
**OAuth (Open Authorization)** é um protocolo aberto que trabalha na camada de autorização possibilitando o acesso a recursos de maneira delegada ou pela aplicação.

1. **O que é o OAuth?**
    - OAuth permite que usuário sejam autorizado nas aplicações de maneira que ela não precisem realizar essas validações.
    - É um protocolo muito utilizado tantos pelos IdPs como por SPs.
    - Nele é previsto o uso de concentimento para acesso aos recursos em nome de um usuário.
    - Trabalha na camada HTTP.
    - Tokens são formatados em JWT.
    - Há 6 tipos de fluxos previstos:
        - Authorization Code grant
        - Client Credentials grant
        - Device Code flow
        - On-Behalf-Of flow
        - Implicit Grant flow
        - Resource Owner Password Credentials grant
    - [RFC 6749](https://www.rfc-editor.org/rfc/rfc6749)

2. **Exemplo de fluxo no Entra ID**
    - Exemplo de fluxo do OAuth com Entra ID

    ![OAuth Flow](./images/oauth.png)


3. **Funcionamento do OAuth**
    - OAuth possui normalmente quatro atores no processo:
        - **Resource Owner**: Agente que irá autorizar o acessar os dados pela aplicação
        - **Client (Application)**: Aplicação que irá realizar o acesso os dados.
        - **Resource Server**: Onde os dados que serão consumidos são disponibilizado.
        - **Authorization Server**: Recurso responsável por emitir os token autorizando o acesso.
    - Workflow:
    
        ![Workflow OAuth](./images/oauth-flow.png)
        - (A) O client solicita a autorização para acesso aos dados localizados no Resource Server ao Authorization Server.
        - (B) O usuário depois de identificado e devidamente autorizado tem os tokens(Access Token e Refresh Token) emitidos pelo Authorization Server.
        - (C) O client em posse do Access Token envia-o para o Resource Server para obter os dados protegidos e realiza esse fluxo até a invalidade do Access Token(F)
        - (G) O client com o token invalido utiliza o Refresh Token para obtenção de novos Tokens e retornar ao item C

4. **Caracteristicas**
   - OAuth apenas atua na camada de AuthZ sendo a camada de AuthN ficando sob responsabilidade do OIDC
   - Possui diversos fluxos com caracteristicas especifica que serão abordados na seção 2
   - Tokens no formato JWT

### Open ID Connect
**OpenID Connect (OIDC)** é um protocolo de autenticação qual utiliza o OAuth 2.0 como base. Seu objetivo é realizar a autenticação dos usuários visto que o OAuth foi desenhado para realizar a AuthZ:

1. **What is OpenID Connect?**
    - **OpenID Connect** a sua implementação é realizada junto com o framework do OAuth tornando a sua utilização facilitada já que ele será emitido também pelo mesmo **Authorization Server**.
    - Possibilita a obtenção de informações do usuário autenticado.

2. **Exemplo de fluxo no Entra ID**
    - O Fluxo do OIDC segue o mesmo padrão do visto no OAuth

3. **Beneficios do OIDC:**
   - Prove uma maneira segura de validar qual a identidade do usuário logado na aplicação entregando nas claims as informações necessárias.
   - Retira da aplicação a responsabilidade de armazenar os dados do usuário e delegando essa atribuição para o IdP entregar conforme a necessidade da aplicação.