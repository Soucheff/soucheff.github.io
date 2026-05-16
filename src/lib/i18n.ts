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
  },
  en: {
    siteName: 'Pedro Soucheff',
    tagline: 'Security and Identity in the Microsoft ecosystem',
    navHome: 'Home',
    navArticles: 'Articles',
    navDemos: 'Demos',
    navTags: 'Tags',
    navSearch: 'Search',
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
