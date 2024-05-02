# SAML2/OAuth/OpenID Connect - Autorização e Autenticação: conceitos e aplicações na plataforma Entra ID (Parte 4 de 6)

**Note:** Esse artigo faz parte de uma série artigos que irá abordar os conceitos de autenticação e autorização e as funcionalidades da família [Microsoft Entra](https://learn.microsoft.com/en-us/entra/): 

* Microsoft Entra ID
* Microsoft Entra ID Protection 
* Microsoft Entra ID Governance
* Microsoft Entra External ID / Azure AD B2C
* Microsoft Entra Internet Access / Microsoft Entra Private Access
* Microsoft Entra Permission Management
* Microsoft Entra Verfified ID
* Microsoft Entra Workload ID


## Introdução
A internet é um espaço de interação e troca de informações entre diversos agentes, como usuários, aplicativos, serviços e recursos. Para garantir a segurança e a privacidade dessas interações, é necessário estabelecer mecanismos de autenticação e autorização que verifiquem a identidade e o acesso dos agentes envolvidos. Os protocolos modernos mais utilizados para esse fim são o **OpenID Connect(OIDC)**, **Open Authentication(OAuth)** e **Security Assertion Markup Language(SAML)**. Esses protocolos objetivam permitir que um aplicativo obtenha acesso limitado a um recurso protegido em nome de um usuário, sem que este tenha que compartilhar suas credenciais com o aplicativo.

O objetivo deste artigo é apresentar os conceitos e as aplicações dos protocolos **SAML**, **OAuth** e **OIDC** usando como IAM o [**Entra ID**](https://learn.microsoft.com/en-us/entra/identity/), explicando como eles operam, quais são os seus benefícios e desafios, e como eles podem ser implementados em diferentes cenários. A tese defendida neste artigo é que o **OAuth** e o **OIDC** são protocolos flexíveis, seguros e eficientes para a gestão de autenticação e autorização na internet, mas que também requerem cuidados e boas práticas para evitar vulnerabilidades e riscos.

O artigo foi divido em 6 seções:
* Seção 1, será feita uma revisão teórica sobre os conceitos de autenticação e autorização, bem como sobre o histórico e a evolução do **protocolo de autenticação e autorização**. 
* Seção 2, será descrito o funcionamento do **SAML**, explicando os seus principais componentes, fluxos e especificações.
* Seção 3, será descrito o funcionamento do **OAuth**, explicando os seus principais componentes, fluxos e especificações.
* Seção 4, será descrito o funcionamento do **OpenID Connect**, explicando os seus principais componentes, fluxos e especificações.
* Seção 5, serão apresentados alguns exemplos de aplicações usando **SAML**, **OAuth** e **OIDC** em diferentes contextos, como redes sociais, serviços de nuvem e dispositivos móveis.
* Seção 6, serão discutidos os benefícios e os desafios do **SAML**,**OAuth** e **OIDC**, analisando as suas vantagens e desvantagens, bem como as suas recomendações e limitações.



## Seção 4 - Revisão teória e conceitos sobre o protocolo OpenID Connect

>Termos: 
> * Authentication => AuthN
> * Authrorization => AuthZ
> * Identity Access Manegament => IAM
> * Identity Provider => IdP
> * Service Provider => SP
> * Single Sign-On => SSO

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