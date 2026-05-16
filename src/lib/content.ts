import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from './i18n';
import { getEntryLocales } from './i18n';

type AnyEntry = CollectionEntry<'articles'> | CollectionEntry<'demos'>;

const filterPublished = <T extends AnyEntry>(entries: T[]): T[] =>
  entries.filter((e) => import.meta.env.DEV || !e.data.draft);

/** Artigos disponíveis no locale informado, ordenados do mais recente para o mais antigo. */
export const getArticlesForLocale = async (locale: Locale): Promise<CollectionEntry<'articles'>[]> => {
  const all = await getCollection('articles');
  const filtered = filterPublished(all).filter((entry) => getEntryLocales(entry).includes(locale));
  filtered.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
  return filtered;
};

/** Demos disponíveis no locale informado, ordenadas do mais recente para o mais antigo. */
export const getDemosForLocale = async (locale: Locale): Promise<CollectionEntry<'demos'>[]> => {
  const all = await getCollection('demos');
  const filtered = filterPublished(all).filter((entry) => getEntryLocales(entry).includes(locale));
  filtered.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
  return filtered;
};

/** Agregação de tags com contagem por collection. */
export interface TagAggregation {
  tag: string;
  articles: number;
  demos: number;
  total: number;
}

export const getTagAggregation = async (locale: Locale): Promise<TagAggregation[]> => {
  const [articles, demos] = await Promise.all([
    getArticlesForLocale(locale),
    getDemosForLocale(locale),
  ]);
  const map = new Map<string, TagAggregation>();
  const bump = (tag: string, kind: 'articles' | 'demos') => {
    const current = map.get(tag) ?? { tag, articles: 0, demos: 0, total: 0 };
    current[kind] += 1;
    current.total += 1;
    map.set(tag, current);
  };
  for (const a of articles) for (const t of a.data.tags) bump(t, 'articles');
  for (const d of demos) for (const t of d.data.tags) bump(t, 'demos');
  return [...map.values()].sort((a, b) => b.total - a.total || a.tag.localeCompare(b.tag));
};
