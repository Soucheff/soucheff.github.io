#!/usr/bin/env node
// @ts-check
/**
 * Pós-processador para o i18n single-source.
 *
 * Cada página renderiza AMBOS os idiomas (PT e EN), e o CSS esconde o que
 * não corresponde ao locale da página via `[data-locale-current]`. Pagefind,
 * entretanto, lê apenas o HTML estático (não executa CSS), portanto adicionamos
 * `data-pagefind-ignore="all"` aos blocos do idioma "errado" para que não
 * apareçam no índice de busca.
 *
 * Roda DEPOIS de `astro build` e ANTES de `pagefind --site dist`.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { globby } from 'globby';

const root = 'dist';

/**
 * Adiciona data-pagefind-ignore="all" em <div data-lang="X"> quando X difere do
 * data-locale-current do ancestral mais próximo.
 *
 * Implementação intencionalmente baseada em string: o HTML produzido pelo Astro
 * é estável (remark-i18n-directive sempre emite `<div data-lang="..." class="...">`)
 * e a marcação do escopo (`<div data-locale-current="...">`) é única por página.
 */
function process(html) {
  // Identifica o locale atual da página
  const m = html.match(/data-locale-current=("|')(pt|en)\1/);
  if (!m) return { html, changed: false };
  const current = m[2];
  const other = current === 'pt' ? 'en' : 'pt';

  // Inserir data-pagefind-ignore="all" na abertura de <div data-lang="OTHER" ...>
  // Só injetamos se ainda não houver o atributo.
  const re = new RegExp(
    `(<div\\b)([^>]*?\\bdata-lang=("|')${other}\\3)([^>]*)(>)`,
    'g',
  );
  let changed = false;
  const next = html.replace(re, (_full, open, attrs, _q, rest, close) => {
    if (/data-pagefind-ignore=/.test(attrs + rest)) return `${open}${attrs}${rest}${close}`;
    changed = true;
    return `${open}${attrs} data-pagefind-ignore="all"${rest}${close}`;
  });
  return { html: next, changed };
}

const files = await globby([`${root}/**/*.html`]);
let modified = 0;

for (const file of files) {
  const html = await readFile(file, 'utf8');
  const { html: next, changed } = process(html);
  if (changed) {
    await writeFile(file, next, 'utf8');
    modified += 1;
  }
}

console.log(`[i18n-pagefind] processed ${files.length} files, modified ${modified}`);
