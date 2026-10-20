import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkDirective from 'remark-directive';
import { fromHtml } from 'hast-util-from-html';
import { toHtml } from 'hast-util-to-html';
import { visit, SKIP } from 'unist-util-visit';
import type { Root, RootContent, Element } from 'hast';
import type { Locale } from './i18n';
import { remarkI18nDirective } from './remark-i18n-directive.mjs';

const markdown = unified().use(remarkParse).use(remarkDirective).use(remarkI18nDirective);

export const formatArticleDate = (date: Date, locale: Locale): string =>
  new Intl.DateTimeFormat(locale === 'pt' ? 'pt-BR' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);

export const tagLabel = (tag: string): string => {
  const labels: Record<string, string> = {
    'microsoft-entra': 'Microsoft Entra',
    'entra-id': 'Entra ID',
    'agent-id': 'Agent ID',
    'ai-agents': 'AI Agents',
    'zero-trust': 'Zero Trust',
    'modern-authentication': 'Modern Authentication',
    'identity-governance': 'Identity Governance',
    'entitlement-management': 'Entitlement Management',
    'conditional-access': 'Conditional Access',
    'authentication-context': 'Authentication Context',
    'aspnet-core': 'ASP.NET Core',
    cae: 'CAE',
    mcp: 'MCP',
    iam: 'IAM',
    oauth: 'OAuth',
    oidc: 'OIDC',
    saml: 'SAML',
  };
  return labels[tag] ?? tag.replaceAll('-', ' ');
};

export const getArticleDetails = (body: string, locale: Locale) => {
  const tree = markdown.parse(body);
  markdown.runSync(tree);
  const words: string[] = [];
  let image: { src: string; alt: string } | undefined;

  visit(tree, (node) => {
    const language = node.data?.hProperties?.['data-lang'];
    if (typeof language === 'string' && language !== locale) return SKIP;
    if (node.type === 'text' || node.type === 'inlineCode' || node.type === 'code') {
      words.push(node.value);
    }
    if (node.type === 'image' && !image && node.url.startsWith('/') && !node.url.startsWith('//')) {
      image = { src: node.url, alt: node.alt ?? '' };
    }
  });

  const wordCount = words.join(' ').match(/[\p{L}\p{N}]+/gu)?.length ?? 0;
  return { readingMinutes: Math.max(1, Math.ceil(wordCount / 200)), image };
};

const textContent = (node: Root | RootContent): string => {
  if (node.type === 'text') return node.value;
  return 'children' in node ? node.children.map(textContent).join('') : '';
};

const normalizedTitle = (text: string): string => text.replace(/\s+/g, ' ').trim().toLocaleLowerCase();

export interface ArticleHeading {
  id: string;
  text: string;
}

export const prepareArticleHtml = (
  html: string,
  locale: Locale,
  title: string,
  tableLabel: string,
) => {
  const tree = fromHtml(html, { fragment: true });
  const headings: ArticleHeading[] = [];
  let titleId: string | undefined;
  let removedTitle = false;

  visit(tree, 'element', (node, index, parent) => {
    if (!parent || index === undefined) return;
    const language = node.properties['dataLang'];
    if (typeof language === 'string' && language !== locale) {
      parent.children.splice(index, 1);
      return [SKIP, index];
    }

    // O primeiro h1 é o título editorial, mesmo quando difere do frontmatter.
    if (node.tagName === 'h1' && (!removedTitle || normalizedTitle(textContent(node)) === normalizedTitle(title))) {
      if (typeof node.properties.id === 'string') titleId = node.properties.id;
      removedTitle = true;
      parent.children.splice(index, 1);
      return [SKIP, index];
    }
    if (node.tagName === 'h1') node.tagName = 'h2';

    if (node.tagName === 'h2') {
      const label = normalizedTitle(textContent(node));
      const nextIndex = parent.children.findIndex(
        (child, childIndex) => childIndex > index && child.type === 'element',
      );
      const next = parent.children[nextIndex];
      if (
        ['conteúdo', 'sumário', 'contents', 'table of contents'].includes(label) &&
        next?.type === 'element' &&
        ['ol', 'ul'].includes(next.tagName)
      ) {
        const links: Element[] = [];
        visit(next, 'element', (element) => {
          if (element.tagName === 'a') links.push(element);
        });
        if (links.length > 0 && links.every((link) => String(link.properties.href).startsWith('#'))) {
          parent.children.splice(nextIndex, 1);
          parent.children.splice(index, 1);
          return [SKIP, index];
        }
      }
      if (typeof node.properties.id === 'string') {
        headings.push({ id: node.properties.id, text: textContent(node) });
      }
    }

    if (node.tagName === 'table') {
      parent.children[index] = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['table-scroll'], role: 'region', tabIndex: 0, ariaLabel: tableLabel },
        children: [node],
      };
      return SKIP;
    }
  });

  return { html: toHtml(tree), headings, titleId };
};
