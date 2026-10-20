import type { CollectionEntry } from 'astro:content';

export type Locale = 'pt' | 'en';

export const LOCALES: Locale[] = ['pt', 'en'];
export const DEFAULT_LOCALE: Locale = 'pt';

export interface UIStrings {
  siteName: string;
  tagline: string;
  navHome: string;
  navArticles: string;
  navDemos: string;
  navTags: string;
  navSearch: string;
  navMenu: string;
  themeToggle: string;
  languageSwitcher: string;
  readMore: string;
  publishedOn: string;
  updatedOn: string;
  author: string;
  tags: string;
  backToList: string;
  latestArticles: string;
  featuredDemos: string;
  viewAllArticles: string;
  viewAllDemos: string;
  noContent: string;
  searchPlaceholder: string;
  searchTitle: string;
  pageNotFound: string;
  pageNotFoundDescription: string;
  homeLink: string;
  techStack: string;
  liveDemo: string;
  sourceCode: string;
  taggedWith: string;
  articleCount: string;
  demoCount: string;
  navAbout: string;
  primaryNavigation: string;
  profileEyebrow: string;
  profileHeadline: string;
  profileIntro: string;
  aboutTitle: string;
  aboutDescription: string;
  connectLinkedIn: string;
  exploreArticles: string;
  editorialEyebrow: string;
  editorialTitle: string;
  featuredArticle: string;
  exploreTopics: string;
  topicsDescription: string;
  articlesDescription: string;
  filterArticles: string;
  filterPlaceholder: string;
  allTopics: string;
  filterEmpty: string;
  clearFilters: string;
  filterCount: string;
  readingMinutes: string;
  tableOfContents: string;
  continueReading: string;
  authorDescription: string;
  backToArticles: string;
  searchDescription: string;
  searchUnavailable: string;
  searchNoScript: string;
  scrollableTable: string;
}

export const ui: Record<Locale, UIStrings> = {
  pt: {
    siteName: 'Pedro Soucheff',
    tagline: 'Segurança e Identidade no ecossistema Microsoft',
    navHome: 'Início',
    navArticles: 'Artigos',
    navDemos: 'Demos',
    navTags: 'Tags',
    navSearch: 'Buscar',
    navMenu: 'Menu',
    themeToggle: 'Alternar tema',
    languageSwitcher: 'Idioma',
    readMore: 'Ler mais',
    publishedOn: 'Publicado em',
    updatedOn: 'Atualizado em',
    author: 'Autor',
    tags: 'Tags',
    backToList: 'Voltar para a lista',
    latestArticles: 'Artigos recentes',
    featuredDemos: 'Demos em destaque',
    viewAllArticles: 'Ver todos os artigos',
    viewAllDemos: 'Ver todas as demos',
    noContent: 'Nenhum conteúdo disponível ainda.',
    searchPlaceholder: 'Buscar artigos e demos...',
    searchTitle: 'Buscar no site',
    pageNotFound: 'Página não encontrada',
    pageNotFoundDescription: 'A página que você procura não existe ou foi movida.',
    homeLink: 'Voltar para o início',
    techStack: 'Stack',
    liveDemo: 'Ver demo',
    sourceCode: 'Código-fonte',
    taggedWith: 'Conteúdo com a tag',
    articleCount: 'artigo(s)',
    demoCount: 'demo(s)',
    navAbout: 'Sobre',
    primaryNavigation: 'Navegação principal',
    profileEyebrow: 'Identidade · Segurança · Microsoft',
    profileHeadline: 'Segurança e identidade, da teoria à prática.',
    profileIntro: 'Artigos, experimentos e aprendizados sobre Microsoft Entra, Zero Trust e a segurança de agentes de IA.',
    aboutTitle: 'Um espaço para compartilhar o que aprendo.',
    aboutDescription: 'Sou Pedro Soucheff. Aqui reúno conceitos, cenários de laboratório e implementações sobre identidade e segurança no ecossistema Microsoft.',
    connectLinkedIn: 'Vamos nos conectar',
    exploreArticles: 'Explorar artigos',
    editorialEyebrow: 'Caderno de campo',
    editorialTitle: 'Ideias que viram prática.',
    featuredArticle: 'Publicação mais recente',
    exploreTopics: 'Explore por assunto',
    topicsDescription: 'Escolha um tema e encontre um ponto de partida.',
    articlesDescription: 'Conceitos, implementações e notas de laboratório. Um acervo sobre identidade e segurança, para consultar no seu ritmo.',
    filterArticles: 'Filtrar artigos',
    filterPlaceholder: 'Título, assunto ou palavra-chave',
    allTopics: 'Todos os assuntos',
    filterEmpty: 'Nenhum artigo corresponde a esses filtros. Tente outra palavra ou escolha outro assunto.',
    clearFilters: 'Limpar filtros',
    filterCount: '{count} de {total} artigos',
    readingMinutes: 'min de leitura',
    tableOfContents: 'Neste artigo',
    continueReading: 'Continue a leitura',
    authorDescription: 'Escrevo sobre identidade, segurança e experiências práticas com tecnologias Microsoft.',
    backToArticles: 'Todos os artigos',
    searchDescription: 'Encontre uma ideia, um conceito ou aquele trecho que você quer consultar de novo.',
    searchUnavailable: 'A busca não pôde ser carregada. Recarregue a página ou explore o catálogo de artigos. No ambiente local, a busca está disponível após npm run build e npm run preview.',
    searchNoScript: 'A busca precisa de JavaScript. Você também pode navegar pelo catálogo de artigos e pelos assuntos.',
    scrollableTable: 'Tabela do artigo. Role horizontalmente para ver todas as colunas.',
  },
  en: {
    siteName: 'Pedro Soucheff',
    tagline: 'Security and Identity in the Microsoft ecosystem',
    navHome: 'Home',
    navArticles: 'Articles',
    navDemos: 'Demos',
    navTags: 'Tags',
    navSearch: 'Search',
    navMenu: 'Menu',
    themeToggle: 'Toggle theme',
    languageSwitcher: 'Language',
    readMore: 'Read more',
    publishedOn: 'Published on',
    updatedOn: 'Updated on',
    author: 'Author',
    tags: 'Tags',
    backToList: 'Back to list',
    latestArticles: 'Latest articles',
    featuredDemos: 'Featured demos',
    viewAllArticles: 'View all articles',
    viewAllDemos: 'View all demos',
    noContent: 'No content available yet.',
    searchPlaceholder: 'Search articles and demos...',
    searchTitle: 'Search the site',
    pageNotFound: 'Page not found',
    pageNotFoundDescription: 'The page you are looking for does not exist or has been moved.',
    homeLink: 'Back to home',
    techStack: 'Stack',
    liveDemo: 'View demo',
    sourceCode: 'Source code',
    taggedWith: 'Content tagged with',
    articleCount: 'article(s)',
    demoCount: 'demo(s)',
    navAbout: 'About',
    primaryNavigation: 'Primary navigation',
    profileEyebrow: 'Identity · Security · Microsoft',
    profileHeadline: 'Security and identity, from theory to practice.',
    profileIntro: 'Articles, experiments, and lessons on Microsoft Entra, Zero Trust, and AI agent security.',
    aboutTitle: 'A place to share what I learn.',
    aboutDescription: 'I am Pedro Soucheff. Here I bring together concepts, lab scenarios, and implementations about identity and security in the Microsoft ecosystem.',
    connectLinkedIn: "Let's connect",
    exploreArticles: 'Explore articles',
    editorialEyebrow: 'Field notes',
    editorialTitle: 'Ideas put into practice.',
    featuredArticle: 'Latest publication',
    exploreTopics: 'Explore by topic',
    topicsDescription: 'Pick a topic and find a place to start.',
    articlesDescription: 'Concepts, implementations, and lab notes. A collection on identity and security to explore at your own pace.',
    filterArticles: 'Filter articles',
    filterPlaceholder: 'Title, topic, or keyword',
    allTopics: 'All topics',
    filterEmpty: 'No articles match these filters. Try another keyword or choose a different topic.',
    clearFilters: 'Clear filters',
    filterCount: '{count} of {total} articles',
    readingMinutes: 'min read',
    tableOfContents: 'On this page',
    continueReading: 'Keep reading',
    authorDescription: 'I write about identity, security, and hands-on experiences with Microsoft technologies.',
    backToArticles: 'All articles',
    searchDescription: 'Find an idea, a concept, or that passage you would like to revisit.',
    searchUnavailable: 'Search could not be loaded. Reload the page or explore the article library. Locally, search is available after npm run build and npm run preview.',
    searchNoScript: 'Search requires JavaScript. You can also browse the article library and topics.',
    scrollableTable: 'Article table. Scroll horizontally to see all columns.',
  },
};

/** Caminho-raiz para uma rota de listagem por collection e idioma. */
export const collectionPath = (
  collection: 'articles' | 'demos' | 'tags' | 'search',
  locale: Locale,
): string => {
  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
  if (collection === 'articles') {
    return locale === 'pt' ? `${prefix}/artigos` : `${prefix}/articles`;
  }
  if (collection === 'demos') {
    return `${prefix}/demos`;
  }
  if (collection === 'tags') {
    return `${prefix}/tags`;
  }
  return locale === 'pt' ? `${prefix}/buscar` : `${prefix}/search`;
};

/** Constrói URL de uma entrada para um locale específico. */
export const entryUrl = (
  collection: 'articles' | 'demos',
  slug: string,
  locale: Locale,
): string => `${collectionPath(collection, locale)}/${slug}`;

/** Locales disponíveis para uma entrada (pt sempre obrigatório, en opcional). */
export const getEntryLocales = (
  entry: CollectionEntry<'articles'> | CollectionEntry<'demos'>,
): Locale[] => {
  const locales: Locale[] = ['pt'];
  if (entry.data.i18n.en) locales.push('en');
  return locales;
};

/** Metadados (title/description) traduzidos para o locale alvo, com fallback PT. */
export const getLocalizedMeta = (
  entry: CollectionEntry<'articles'> | CollectionEntry<'demos'>,
  locale: Locale,
): { title: string; description: string } => {
  const data = entry.data.i18n[locale] ?? entry.data.i18n.pt;
  return { title: data.title, description: data.description };
};

/**
 * Filtra o HTML renderizado mantendo apenas blocos `<div data-lang="locale">`
 * relativos ao locale alvo. Blocos com outros idiomas são removidos.
 * Conteúdo fora de qualquer `<div data-lang="...">` é considerado neutro
 * e fica em todas as línguas.
 *
 * Implementação: parsing leve por regex sobre `<div data-lang="...">` no nível
 * superior. Como o remark plugin sempre produz `<div data-lang="..." class="lang-block lang-XX">`,
 * a regex captura blocos balanceados (sem aninhamento de outros `data-lang`).
 */
export const extractLocaleHtml = (html: string, locale: Locale): string => {
  // Regex casa <div data-lang="xx" class="lang-block lang-xx"> ... </div>
  // Aceitamos espaços e ordens variadas nos atributos.
  const pattern = /<div\b[^>]*\bdata-lang=("|')(pt|en)\1[^>]*>([\s\S]*?)<\/div>/g;
  return html.replace(pattern, (_match, _quote, blockLocale: Locale, inner: string) => {
    if (blockLocale === locale) return inner;
    return '';
  });
};

/** Helper para construir alternate hreflang links em <head>. */
export const buildHreflangs = (
  entry: CollectionEntry<'articles'> | CollectionEntry<'demos'>,
  collection: 'articles' | 'demos',
  slug: string,
  site: string,
): Array<{ hreflang: string; href: string }> => {
  const locales = getEntryLocales(entry);
  return locales.map((loc) => ({
    hreflang: loc === 'pt' ? 'pt-BR' : 'en-US',
    href: `${site}${entryUrl(collection, slug, loc)}`,
  }));
};
