# Pedro Soucheff — Segurança e Identidade no ecossistema Microsoft

[![Deploy](https://github.com/soucheff/soucheff.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/soucheff/soucheff.github.io/actions/workflows/deploy.yml)
[![Site](https://img.shields.io/badge/site-soucheff.github.io-0078D4)](https://soucheff.github.io)
[![Code: MIT](https://img.shields.io/badge/code-MIT-blue.svg)](LICENSE)
[![Content: CC BY 4.0](https://img.shields.io/badge/content-CC%20BY%204.0-22C55E.svg)](LICENSE-content)

Site pessoal de **Pedro Soucheff** — artigos técnicos e demonstrações práticas sobre
**Microsoft Entra ID**, **Zero Trust**, **IAM**, **Microsoft Defender** e segurança em Azure.
Conteúdo em **PT-BR** (padrão) e **EN**.

> 🌐 Acesse em **https://soucheff.github.io**

---

## Stack

| Camada | Tecnologia |
| --- | --- |
| Gerador estático | [Astro 4](https://astro.build) + TypeScript |
| Conteúdo | Markdown / MDX (Content Collections + Zod) |
| Realce de código | [Shiki](https://shiki.style) (dual-theme light/dark) |
| Diagramas | [Mermaid](https://mermaid.js.org) via `rehype-mermaid` (SVG inline, zero JS no cliente) |
| Ilhas interativas | [React](https://react.dev) via `@astrojs/react` |
| Estilo | [Tailwind v3](https://tailwindcss.com) + tokens CSS (identidade editorial, claro/escuro) |
| Busca | [Pagefind](https://pagefind.app) (client-side, pós-build) |
| Hosting | GitHub Pages via GitHub Actions |

---

## Experiência do portal

- **Perfil e início**: apresentação pessoal, LinkedIn e GitHub, publicação mais recente e
  navegação por assuntos. A seção e o menu de demos aparecem apenas quando há demos publicadas.
- **Catálogo**: busca instantânea por título, descrição e tags, combinada com filtro por assunto.
  Os filtros ficam na URL (`?q=...&tag=...`), podem ser compartilhados e não dependem do Pagefind.
  Sem JavaScript, o catálogo completo continua disponível.
- **Leitura**: sumário gerado a partir dos títulos do idioma atual, estimativa de leitura
  (200 palavras/minuto, incluindo código), tabelas e código com rolagem própria, identificação
  do autor e sugestões de artigos ao final.
- **Capas**: o destaque usa o campo `cover` existente ou a primeira imagem local do corpo no
  idioma da página. As imagens são exibidas completas, sem recortar diagramas.
- **Idiomas**: início, catálogo e busca compartilham os mesmos componentes em PT/EN.
  O corpo dos artigos é filtrado no build; títulos repetidos e sumários manuais equivalentes
  são tratados na apresentação, sem modificar os arquivos de conteúdo.

Links profissionais e iniciais ficam em `src/lib/profile.ts`. Os textos traduzidos ficam em
`src/lib/i18n.ts`. O perfil não depende de consulta ao LinkedIn ou de outro serviço externo.

---

## Como adicionar um artigo

1. Crie um arquivo em `src/content/articles/<slug>.md`. Use kebab-case no nome (ex.: `entra-id-mfa.md`).
2. Use o template de frontmatter abaixo. O bloco `i18n.pt` é **obrigatório**; `i18n.en` é opcional
   (sem ele, o artigo só publica em português).
3. Escreva o corpo dividindo as línguas com directives `:::lang{pt}` e `:::lang{en}`.
   Blocos **sem** marca de idioma (ex.: blocos de código, Mermaid) aparecem em **ambas** as versões.
4. `npm run dev` e acesse `http://localhost:4321/artigos/<slug>` para revisar PT, e
   `http://localhost:4321/en/articles/<slug>` para EN.
5. Abra um PR a partir de uma branch `feature/artigo-<slug>`.

### Template — `src/content/articles/<slug>.md`

```markdown
---
pubDate: 2026-05-16
author: Pedro Soucheff
tags:
  - entra-id
  - zero-trust
i18n:
  pt:
    title: Título em português
    description: Descrição curta (1–2 linhas) em português.
  en:
    title: Title in English
    description: Short description (1–2 lines) in English.
---

:::lang{pt}
## Introdução

Conteúdo em português...
:::

:::lang{en}
## Introduction

Content in English...
:::

<!-- Blocos sem :::lang{} aparecem em AMBAS as línguas (ex.: código e diagramas). -->

```mermaid
flowchart LR
    A[Usuário / User] --> B[Entra ID]
```

```powershell
New-MgIdentityConditionalAccessPolicy ...
```
```

### Convenções

- **Slug**: kebab-case, mesmo nome de arquivo (sem extensão) é a URL.
- **Tags**: lowercase-kebab-case (`entra-id`, `zero-trust`, `microsoft-defender`).
- **Datas**: ISO (`YYYY-MM-DD`). Use `updatedDate` para revisões posteriores.
- **Drafts**: `draft: true` no frontmatter — visível em dev, oculto em produção.

---

## Como adicionar uma demo

Praticamente igual a um artigo, mas em `src/content/demos/<slug>.mdx`, com campos extras
para a stack e links da demo. MDX permite importar componentes React para interatividade.

### Template — `src/content/demos/<slug>.mdx`

```mdx
---
pubDate: 2026-05-16
author: Pedro Soucheff
tags: [demo, react]
tech: [Astro, React, TypeScript]
repoUrl: https://github.com/soucheff/algum-repo
liveUrl: https://exemplo.com
i18n:
  pt:
    title: Nome da demo em português
    description: O que ela demonstra.
  en:
    title: Demo name in English
    description: What it demonstrates.
---

import MeuComponente from '@/components/demo/MeuComponente.tsx';

:::lang{pt}
## Sobre a demo
Explicação em português...
:::

:::lang{en}
## About the demo
Explanation in English...
:::

<MeuComponente client:visible />
```

Diretivas de hidratação React: `client:load`, `client:visible`, `client:idle`, `client:only`.
Prefira `client:visible` para componentes pesados.

---

## Imagens e assets

Imagens dos artigos vivem em `public/images/articles/<slug>/` e são referenciadas por caminho
absoluto (ex.: `/images/articles/modern-auth-01/basicAuth-Flow.png`). Imagens externas (YouTube
thumbnails, diagramas hospedados em outro lugar) podem ser usadas via URL direta.

### Otimizar imagens

O repositório inclui um otimizador baseado em [sharp](https://sharp.pixelplumbing.com) que
redimensiona (largura máxima de 1600 px) e recomprime PNG/JPEG **in-place**, substituindo o
original apenas se o resultado ficar menor (idempotente — seguro para rodar várias vezes):

```powershell
npm run optimize:images
```

O script percorre `public/images/**/*.{png,jpg,jpeg}`, aplica paleta + compressão nível 9 em
PNGs e mozjpeg q82 progressivo em JPEGs, e imprime um relatório de redução por arquivo. Rode
antes de commitar imagens novas — em PNGs de diagrama é típico ver **-65% a -77%** de redução
sem perda visual perceptível.

---

## Rodando localmente

```powershell
# Pré-requisitos: Node 24 (veja .nvmrc) e npm.
npm ci
npm run dev        # http://localhost:4321
npm run build      # gera dist/ + indexa com Pagefind
npm run preview    # serve dist/ para testar
npm run lint       # ESLint para Astro, TypeScript e JavaScript
npx tsc --noEmit   # verifica também os testes e a configuração do Playwright
npm test           # testes Playwright contra dist/; execute npm run build antes
```

Em primeira instalação, o build executa `playwright install chromium` automaticamente quando
o `rehype-mermaid` precisa renderizar diagramas. Se preferir pular Mermaid em dev, basta não
incluir blocos `mermaid` no conteúdo em edição.

### Validação da experiência

```sh
npm run lint
npm run check
npx tsc --noEmit
npm run build
npm test
```

A suíte usa o Chromium já necessário para o Mermaid e inicia/encerra seu próprio preview em
`127.0.0.1:4431`. Cobre navegação mobile, filtros e URLs compartilháveis, sumário e idioma,
busca Pagefind real, ausência de JavaScript, preferências de movimento, contraste de texto
nos dois temas e ausência de transbordamento em 320, 390, 768 e 1440 px.
Também verifica um orçamento de 30 KiB gzip de JavaScript efetivamente carregado por rota de apresentação
(o Pagefind é carregado separadamente apenas na busca). A CI executa lint e testes antes do deploy.

No servidor de desenvolvimento, o índice Pagefind não existe: a busca mostra uma mensagem
explicativa. Para testar a busca completa, use o build de produção com `npm run preview`.
O índice inclui apenas artigos e demos; páginas de perfil, catálogos e tags não duplicam
os resultados.
O idioma dos resultados é selecionado automaticamente pelo Pagefind a partir do `lang`
da página, sem expor filtros técnicos ao visitante.

---

## Estrutura do projeto

```
soucheff.github.io/
├── .github/
│   ├── workflows/deploy.yml        # CI/CD para GitHub Pages
│   ├── ISSUE_TEMPLATE/             # formulários de issues
│   ├── CODEOWNERS
│   └── pull_request_template.md
├── public/                         # assets estáticos (favicon, robots, imagens)
├── scripts/
│   ├── postbuild-i18n-pagefind.mjs # injeta data-pagefind-ignore por idioma
│   └── optimize-images.mjs         # otimizador PNG/JPEG via sharp (npm run optimize:images)
├── src/
│   ├── components/                 # Header, Footer, ThemeToggle, Cards, demo/*
│   │   └── pages/                  # HomePage, ArticlesPage e SearchPage compartilhadas PT/EN
│   ├── content/
│   │   ├── config.ts               # schemas Zod (articles, demos)
│   │   ├── articles/<slug>.md      # artigos bilíngues
│   │   └── demos/<slug>.mdx        # demos bilíngues (com React opcional)
│   ├── layouts/                    # BaseLayout, ArticleLayout, DemoLayout
│   ├── lib/
│   │   ├── i18n.ts                 # strings de UI + helpers de locale
│   │   ├── content.ts              # queries de coleções
│   │   ├── article.ts              # metadados localizados, sumário e apresentação da leitura
│   │   ├── profile.ts              # identidade e links profissionais
│   │   └── remark-i18n-directive.mjs # plugin :::lang{}
│   ├── pages/
│   │   ├── index.astro             # home PT
│   │   ├── artigos/                # PT
│   │   ├── demos/                  # PT
│   │   ├── tags/                   # PT
│   │   ├── buscar.astro            # PT (Pagefind UI)
│   │   ├── en/                     # espelho EN (/en/articles, /en/demos, ...)
│   │   └── 404.astro
│   └── styles/
│       ├── tokens.css              # paleta Microsoft (CSS vars)
│       └── global.css              # Tailwind base + componentes
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── eslint.config.mjs
├── playwright.config.ts
└── package.json
```

---

## Deploy

Todo push em `main` dispara o workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):

1. Checkout
2. Setup Node (lê `.nvmrc`) + `npm ci`
3. `npx playwright install --with-deps chromium` (necessário para Mermaid inline-svg)
4. `npm run build` (Astro check → Astro build → post-process i18n → Pagefind index)
5. `npm run lint` e `npm test`
6. Upload do artifact `dist/`
7. Job de deploy → `actions/deploy-pages@v5` publica em `https://soucheff.github.io`

Execuções manuais (`workflow_dispatch`) em branches de feature ou release validam o build,
lint e testes sem publicar. O job de publicação só executa para `refs/heads/main`.

> **Settings → Pages**: a *source* deve estar configurada como **GitHub Actions** (não "Deploy from a branch").

---

## Identidade visual

Identidade editorial com fundo de papel, tipografia serifada nos títulos, corpo sem serifa
e azul nos pontos de ação. As fontes usam alternativas locais, sem downloads externos.

| Token | Hex | Uso |
| --- | --- | --- |
| `--color-bg` | `#F7F7F2` / `#131C22` | Fundo claro / escuro |
| `--color-primary` | `#254EC3` / `#A7BFFF` | Links e ações |
| `--color-accent` | `#276449` / `#9BD5B5` | Pequenos destaques |
| `--color-surface` | `#FFFFFF` / `#1A272E` | Superfícies |
| `--color-text` | `#202B30` / `#EFF3EE` | Texto principal |
| `--color-text-muted` | `#58666A` / `#AFBFBE` | Texto secundário |

Modo claro derivado automaticamente; toggle persistente em `localStorage` com fallback em
`prefers-color-scheme`.
As animações são discretas, limitadas à entrada de elementos, e desativadas em telas
de toque ou quando o visitante prefere movimento reduzido.

---

## Contribuindo

- **Issues**: use os formulários em "New issue" — há templates para sugerir artigos, sugerir demos,
  reportar erro de conteúdo e bug do site.
- **Pull Requests**: usam o template em [`.github/pull_request_template.md`](.github/pull_request_template.md).
- **Reviewers**: `@soucheff` é o code owner padrão (ver [`.github/CODEOWNERS`](.github/CODEOWNERS)).
- **Discussões abertas**: aba [Discussions](https://github.com/soucheff/soucheff.github.io/discussions).

---

## Licenças

- **Código** (Astro, TypeScript, componentes, scripts): [MIT](LICENSE)
- **Conteúdo** (artigos, demos, textos editoriais sob `src/content/`): [CC BY 4.0](LICENSE-content) —
  reutilize livremente com atribuição a *Pedro Soucheff* e link para o artigo original.

---

## Contato

- GitHub: [@soucheff](https://github.com/soucheff)
- Site: [soucheff.github.io](https://soucheff.github.io)
