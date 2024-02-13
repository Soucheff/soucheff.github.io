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
> * Identity Provider => IDP
> * Service Provider => SP

### Conceitos basico - Autenticação e Autorização
A Autenticação(AuthN) é o processo de identitificar o agente, ou seja responder a perguntar "Who are you?".

Já o processo de Autorização(AuthZ) é ação de conceder permissão de acesso aos recursos solicitados, desde que devidamente autenticado e autorizado.

### Era das senhas(passwords): O inicio
A ideia de termos uma senha como meio para nos identificar com já que inicialmente seria algo que somente nós saberiamos e portanto a aplicação conseguiria autenticar o usuário.

Porém esse tipo de estrátegia no inicio foi implementada com as senhas em clear text sem nenhum metodo de hashing possibilitando que quem tivesse acesso aos datastores onde haviam os usuários e senhas podessem ser lidos facilmente e logo outras agentes conseguiriam se passar pelo usuário:

Exemplo da uma tabela com senha em clear text:
| Username          | Password       |
|-------------------|----------------|
| Admin             | Admin01        |
| User01            | User0101       |
| User02            | USer0202       |

#### Evolução das senhas
Para uma melhoria na segurança das senhas começou a ser utilizado processo para encriptirar as senha sendo os melhor processos que fossem não reversiveis como por exemplo: MD5, SHA1, SHA256
Exemplo da mesma tabela usando MD5:
```python
import hashlib
password = (b'Admin01')
result = hashlib.md5(password)
print(str(password)+' - '+result.hexdigest())
password = (b'User0101')
result = hashlib.md5(password)
print(str(password)+' - '+result.hexdigest())
password = (b'USer0202')
result = hashlib.md5(password)
print(str(password)+' - '+result.hexdigest())
```
| Username          | Hashed Password                   |
|------------------ |-----------------                  |
| Admin             | 5b56707735bed7117162b252685a19a1  |
| User01            | 961b2abefbbe46d11941b3f12583ae27  |
| User02            | 4979bbde735adc79fa65fc231ce31b8a  |

### Uso de protocolos modernos de autenticação e autorização

Como vimos anteriormente o uso de senha é uma das maneiras dos usuário se autenticarem porém a adoção desse metodo cada aplicação deverá ser responsavel em proteger esses dados além de implementar melhorias de segurança

Portanto o ideal é a delegeção nessa arquitetura para que a autenticação e autorização seja realizada por sistemas especializados nessa ação liberando que a aplicação concentre-se em implementar as regras de negócio.

Com isso começamos a ver a figura dos IAMs que irão atuar como IDPs para as aplicações. Para que toda a ação ocorra com segurança e eficiencia se faz necessário o uso de protocolos para essa atividade.





### Melhorias
- **NIST Guidelines**: Users no longer need special characters in passwords. Increased character allowances and password managers are encouraged⁶.
- **Multi-Factor Authentication (MFA)**: A supplement to passwords, MFA prompts users to enter a code after their password.
- **Passwordless**: Autenticação utilizando outras maneiras de validar a identitdade sem necessidade de senha


Source: Conversation with Bing, 2/13/2024
(1) undefined. https://pages.nist.gov/800-63-3/sp800-63b.html.
(2) The Evolution of Authentication - OWASP Foundation. https://owasp.org/www-chapter-vancouver/assets/presentations/2020-08_The_Evolution_of_Authentication.pdf.
(3) The evolution of authentication - BAI. https://www.bai.org/banking-strategies/the-evolution-of-authentication/.
(4) The Evolution of Authentication to a Passwordless World. https://www.loginradius.com/blog/growth/authentication-evolution-to-passwordless/.
(5) The Evolution of Authentication | WIRED. https://www.wired.com/insights/2014/04/evolution-authentication/.
(6) THE EVOLUTION OF AUTHENTICATION - Goode Intelligence. https://www.goodeintelligence.com/wp-content/uploads/2019/06/Goode-Intelligence-White-Paper-The_Evolution_of_Authentication.pdf.