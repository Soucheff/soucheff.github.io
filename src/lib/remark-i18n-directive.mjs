// @ts-check
/**
 * remark-i18n-directive
 *
 * Transforma directives `:::lang{xx} ... :::` (containerDirective de remark-directive)
 * em nodes HTML/JSX equivalentes a `<div data-lang="xx">...</div>`.
 *
 * O conteúdo MARKDOWN dentro do container é preservado e renderizado normalmente.
 * Não filtramos por idioma aqui — quem decide qual `<div data-lang>` mantém é o
 * helper `extractLocaleHtml` em src/lib/i18n.ts, aplicado no template da rota,
 * porque o locale alvo varia por página gerada (não é global).
 *
 * Diretivas suportadas:
 *   :::lang{pt}
 *   conteúdo PT
 *   :::
 *
 *   :::lang{en}
 *   English content
 *   :::
 *
 * Diretivas com nome diferente são ignoradas (mantidas como estão para outros plugins).
 */

import { visit } from 'unist-util-visit';

const VALID_LANGS = new Set(['pt', 'en']);

export function remarkI18nDirective() {
  return (tree) => {
    visit(tree, (node) => {
      if (
        node.type !== 'containerDirective' &&
        node.type !== 'leafDirective' &&
        node.type !== 'textDirective'
      ) {
        return;
      }
      if (node.name !== 'lang') return;

      // O atributo do idioma vem como uma chave com valor vazio em
      // node.attributes (ex.: { pt: '' }) por causa da sintaxe `:::lang{pt}`.
      const attrs = node.attributes ?? {};
      let lang = null;
      for (const key of Object.keys(attrs)) {
        if (VALID_LANGS.has(key)) {
          lang = key;
          break;
        }
      }
      if (!lang && typeof attrs.value === 'string' && VALID_LANGS.has(attrs.value)) {
        lang = attrs.value;
      }
      if (!lang) return;

      const data = (node.data ??= {});
      data.hName = 'div';
      data.hProperties = {
        ...(data.hProperties ?? {}),
        'data-lang': lang,
        className: ['lang-block', `lang-${lang}`],
      };
    });
  };
}

export default remarkI18nDirective;
