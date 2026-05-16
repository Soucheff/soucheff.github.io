import { defineCollection, z } from 'astro:content';

const i18nMeta = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

const localizedI18n = z.object({
  pt: i18nMeta,
  en: i18nMeta.optional(),
});

const articles = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      author: z.string().default('Pedro Soucheff'),
      cover: image().optional(),
      i18n: localizedI18n,
    }),
});

const demos = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      author: z.string().default('Pedro Soucheff'),
      cover: image().optional(),
      tech: z.array(z.string()).default([]),
      repoUrl: z.string().url().optional(),
      liveUrl: z.string().url().optional(),
      i18n: localizedI18n,
    }),
});

export const collections = { articles, demos };
