# SAML2/OAuth/OpenID Connect - Autorização e Autenticação: conceitos e aplicações na plataforma Entra ID (Parte 2 de 6)

**Note:** Esse artigo faz parte de uma série artigos que irá abordar os conceitos de autenticação e autorização e as funcionalidades da família [Microsoft Entra](https://learn.microsoft.com/en-us/entra/): 

* Microsoft Entra ID
* Microsoft Entra ID Protection 
* Microsoft Entra ID Governance
* Microsoft Entra External ID / Azure AD B2C
* Microsoft Entra Internet Access / Microsoft Entra Private Access
* Microsoft Entra Permission Management
* Microsoft Entra Verfified ID
* Microsoft Entra Workload ID


## RECAP - Introdução
A internet é um espaço de interação e troca de informações entre diversos agentes, como usuários, aplicativos, serviços e recursos. Para garantir a segurança e a privacidade dessas interações, é necessário estabelecer mecanismos de autenticação e autorização que verifiquem a identidade e o acesso dos agentes envolvidos. Os protocolos modernos mais utilizados para esse fim são o **OpenID Connect(OIDC)**, **Open Authentication(OAuth)** e **Security Assertion Markup Language(SAML)**. Esses protocolos objetivam permitir que um aplicativo obtenha acesso limitado a um recurso protegido em nome de um usuário, sem que este tenha que compartilhar suas credenciais com o aplicativo.

O objetivo deste artigo é apresentar os conceitos e as aplicações dos protocolos **SAML**, **OAuth** e **OIDC** usando como IAM o [**Entra ID**](https://learn.microsoft.com/en-us/entra/identity/), explicando como eles operam, quais são os seus benefícios e desafios, e como eles podem ser implementados em diferentes cenários. A tese defendida neste artigo é que o **OAuth** e o **OIDC** são protocolos flexíveis, seguros e eficientes para a gestão de autenticação e autorização na internet, mas que também requerem cuidados e boas práticas para evitar vulnerabilidades e riscos.

O artigo foi divido em 6 seções:
* Seção 1, será feita uma revisão teórica sobre os conceitos de autenticação e autorização, bem como sobre o histórico e a evolução do **protocolo de autenticação e autorização**. 
* **Seção 2, será descrito o funcionamento do **SAML**, explicando os seus principais componentes, fluxos e especificações.**
* Seção 3, será descrito o funcionamento do **OAuth**, explicando os seus principais componentes, fluxos e especificações.
* Seção 4, será descrito o funcionamento do **OpenID Connect**, explicando os seus principais componentes, fluxos e especificações.
* Seção 5, serão apresentados alguns exemplos de aplicações usando **SAML**, **OAuth** e **OIDC** em diferentes contextos, como redes sociais, serviços de nuvem e dispositivos móveis.
* Seção 6, serão discutidos os benefícios e os desafios do **SAML**,**OAuth** e **OIDC**, analisando as suas vantagens e desvantagens, bem como as suas recomendações e limitações.



## Seção 2 - Revisão teória e conceitos sobre o protocolo SAML2

>Termos: 
> * Authentication => AuthN
> * Authrorization => AuthZ
> * Identity Access Manegament => IAM
> * Identity Provider => IdP
> * Service Provider => SP
> * Single Sign-On => SSO

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

5. **Troubleshooting**

6. **Segurança** // Golden Ticket SAML
