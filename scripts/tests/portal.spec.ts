import { test, expect } from 'playwright/test';
import { gzipSync } from 'node:zlib';
import { readFile } from 'node:fs/promises';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import { getArticleDetails, prepareArticleHtml, formatArticleDate } from '../../src/lib/article';

const mediumArticlePath = '/artigos/autenticacao-contexto-cae-aspnet-core';
const mediumArticleTitle = 'Autenticação Baseada em Contexto e CAE (Continuous Access Evaluation) em Aplicações ASP.NET Core';

test('Medium republication keeps its original date and source, with reviewed examples and local images', async ({ page }) => {
  await page.goto(mediumArticlePath);
  await expect(page.locator('main h1')).toHaveText(mediumArticleTitle);
  await expect(page.locator('.article-byline time')).toHaveAttribute('datetime', '2026-01-05T00:00:00.000Z');
  await expect(page.locator('.article-updated time')).toHaveAttribute('datetime', '2026-10-18T00:00:00.000Z');
  await expect(page.locator('.article-body a').filter({ hasText: /^Medium$/ })).toHaveAttribute('href', /7049015ea466$/);
  await expect(page.locator('.article-body pre')).toHaveCount(20);
  const images = page.locator('.article-body img');
  await expect(images).toHaveCount(12);
  for (const image of await images.all()) {
    await expect(image).toHaveAttribute('src', /^\/images\/articles\/autenticacao-contexto-cae-aspnet-core\//);
    await expect(image).toHaveAttribute('alt', /.+/);
  }
  await expect.poll(() => images.evaluateAll((elements) =>
    elements.every((element) => element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0),
  )).toBe(true);
  await expect(page.locator('.article-body')).toContainText('MicrosoftIdentityConsentAndConditionalAccessHandler');
  await expect(page.locator('.article-body')).toContainText('Revisão técnica da republicação');
  await expect(page.locator('.article-body')).toContainText('o exemplo não recebe nem aplica eventos de revogação');
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
});

test('published C# excerpts retain the reviewed challenge and authorization safeguards', async () => {
  const markdown = await readFile(new URL('../../src/content/articles/autenticacao-contexto-cae-aspnet-core.md', import.meta.url), 'utf8');
  const snippets: string[] = [];
  visit(unified().use(remarkParse).parse(markdown), 'code', (node) => {
    if (node.lang === 'csharp') snippets.push(node.value);
  });
  const details = snippets.find((code) => code.includes('Task<ActionResult> Details('));
  const update = snippets.find((code) => code.includes('Task<ActionResult> Update('));
  const audit = snippets.find((code) => code.includes('IActionResult Get(') && code.includes('_logger.LogInformation'));
  if (!details || !update || !audit) throw new Error('Reviewed controller excerpts are missing');
  expect(details.match(/_downstreamApi\./g)).toHaveLength(1);
  expect(update.match(/_downstreamApi\./g)).toHaveLength(1);
  for (const code of snippets.filter((snippet) => snippet.includes('_consentHandler.ChallengeUser('))) {
    const afterChallenge = code.slice(code.indexOf('_consentHandler.ChallengeUser('));
    expect(afterChallenge).not.toContain('_downstreamApi.');
    expect(afterChallenge).toContain('return new EmptyResult();');
  }
  expect(update).toContain('Url.Action("Edit", "TodoList", new { id })');
  expect(update).toContain('RedirectToAction("Challenge", "Account"');
  expect(audit).toContain('item.Owner != _currentPrincipalId');
  expect(audit).toContain('return NotFound();');
  expect(audit).toContain('[RequiredScope(');
  expect(audit.indexOf('TodoStore.TryGetValue')).toBeLessThan(audit.indexOf('_logger.LogInformation'));
  expect(audit.indexOf('CheckForRequiredAuthContext')).toBeLessThan(audit.indexOf('return Ok(item)'));
});

test('Portuguese-only publications and topics do not offer nonexistent English translations', async ({ page }) => {
  for (const path of [mediumArticlePath, '/tags/cae']) {
    await page.goto(path);
    const language = page.getByRole('group', { name: 'Idioma', exact: true });
    await expect(language.locator('a[hreflang="en-US"]')).toHaveCount(0);
    await expect(language.locator('[aria-disabled="true"]')).toHaveText('EN');
    await expect(page.locator('link[rel="alternate"][hreflang="en-US"]')).toHaveCount(0);
  }
  await page.goto('/en/articles');
  await expect(page.locator('main a[href*="/autenticacao-contexto-cae-aspnet-core"]')).toHaveCount(0);
  const response = await page.goto('/en/articles/autenticacao-contexto-cae-aspnet-core');
  expect(response?.status()).toBe(404);
});

test('Medium article is discoverable by topic and full-text search', async ({ page }) => {
  await page.goto('/artigos?tag=cae');
  await expect(page.locator('[data-filter-item]:visible')).toHaveCount(1);
  await expect(page.locator('[data-filter-item]:visible .article-card-title a')).toHaveAttribute('href', mediumArticlePath);
  await page.goto('/buscar?q=Continuous%20Access%20Evaluation');
  await expect(page.locator(`.pagefind-ui__result-link[href^="${mediumArticlePath}/"]`).first()).toBeVisible({ timeout: 15_000 });
});

test('home presents the author, latest publication, and real destinations', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Pedro Soucheff');
  await expect(page.locator('main h1')).toHaveText('Pedro Soucheff.');
  await expect(page.getByRole('link', { name: 'Explorar artigos', exact: true })).toHaveAttribute('href', '/artigos');
  await expect(page.getByRole('link', { name: 'LinkedIn', exact: true }).first()).toHaveAttribute('href', 'https://www.linkedin.com/in/pedro-soucheff/');
  await expect(page.locator('header a[href="/demos"]')).toHaveCount(0);
  await expect(page.locator('main')).not.toContainText('Nenhum conteúdo disponível');
  await expect(page.locator('.article-card--featured')).toHaveCount(1);
  await expect(page.locator('#sobre')).toContainText('Sou Pedro Soucheff');

  await page.goto('/en/');
  await expect(page.locator('.hero-intro')).toContainText('Articles, experiments');
  await expect(page.locator('.article-card--featured .article-card-title a')).toHaveAttribute('href', /^\/en\/articles\//);
});

test('catalog combines accent-insensitive keywords and exact topics, persists filters, and clears empty results', async ({ page }) => {
  await page.goto('/artigos');
  const items = page.locator('[data-filter-item]:visible');
  const total = await items.count();
  expect(total).toBeGreaterThan(0);
  await page.getByRole('searchbox', { name: 'Filtrar artigos', exact: true }).fill('autorizacao');
  await page.getByLabel('Explore por assunto', { exact: true }).selectOption('oidc');
  await expect(items).toHaveCount(1);
  await expect(items).toContainText('Modern Authentication');
  await expect(page).toHaveURL(/q=autorizacao&tag=oidc/);
  await page.reload();
  await expect(page.getByRole('searchbox', { name: 'Filtrar artigos', exact: true })).toHaveValue('autorizacao');
  await expect(page.getByLabel('Explore por assunto', { exact: true })).toHaveValue('oidc');
  await expect(items).toHaveCount(1);
  await page.getByRole('searchbox', { name: 'Filtrar artigos', exact: true }).fill('nenhum-resultado-xyz');
  await expect(items).toHaveCount(0);
  await expect(page.locator('[data-filter-empty]')).toBeVisible();
  await page.getByRole('button', { name: 'Limpar filtros', exact: true }).first().click();
  await expect(items).toHaveCount(total);
  await expect(page).toHaveURL(/\/artigos\/?$/);
  await expect(page.getByRole('searchbox', { name: 'Filtrar artigos', exact: true })).toBeFocused();
});

test('topic links open a prefiltered library and unknown topics have an explicit empty state', async ({ page }) => {
  await page.goto('/');
  const href = await page.locator('.topic-link').first().getAttribute('href');
  expect(href).toBeTruthy();
  await page.locator('.topic-link').first().click();
  const tag = new URL(page.url()).searchParams.get('tag');
  await expect(page.locator('#article-topic')).toHaveValue(tag ?? '');
  expect(await page.locator('[data-filter-item]:visible').count()).toBeGreaterThan(0);
  await page.goto('/artigos?tag=assunto-inexistente');
  await expect(page.locator('[data-filter-item]:visible')).toHaveCount(0);
  await expect(page.locator('[data-filter-empty]')).toBeVisible();
});

for (const locale of ['pt', 'en'] as const) {
  test(`article has one title, localized body, working outline, and scrollable tables (${locale})`, async ({ page }) => {
    const path = locale === 'pt' ? '/artigos' : '/en/articles';
    await page.goto(`${path}/entra-agentid-accesspackage`);
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator(`.article-body [data-lang="${locale === 'pt' ? 'en' : 'pt'}"]`)).toHaveCount(0);
    expect(await page.locator('[data-article-toc] a').count()).toBeGreaterThan(5);
    const missingTargets = await page.locator('[data-article-toc] a').evaluateAll((links) =>
      links.map((link) => link.getAttribute('href') ?? '').filter((href) => !document.getElementById(decodeURIComponent(href.slice(1)))),
    );
    expect(missingTargets).toEqual([]);
    await expect(page.locator('[data-article-toc]')).toHaveAttribute('open', '');
    expect(await page.locator('.table-scroll > table').count()).toBeGreaterThan(0);
    await expect(page.locator('.article-body h2').filter({ hasText: /^(Conteúdo|Contents|Table of contents)$/ })).toHaveCount(0);
    const published = page.locator('.article-byline time');
    await expect(published).toHaveAttribute('datetime', '2026-08-09T00:00:00.000Z');
    await expect(published).toContainText('9');
    for (const link of await page.locator('.related-articles .article-card-title a').all()) {
      await expect(link).toHaveAttribute('href', new RegExp(`^${path}/`));
    }
  });
}

test('main pages never overflow the viewport at 320, 390, 768, or 1440 pixels', async ({ page }) => {
  const paths = ['/', '/en/', '/artigos', '/en/articles', '/artigos/entra-agentid-accesspackage', '/en/articles/entra-agentid-accesspackage', '/tags', '/demos'];
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of paths) {
      await page.goto(path);
      const contentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(contentWidth, `${path} at ${width}px`).toBeLessThanOrEqual(width);
    }
  }
});

test('mobile navigation closes with Escape and navigates, and the outline starts collapsed', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const menu = page.locator('[data-mobile-menu]');
  await menu.locator('summary').click();
  await expect(menu).toHaveAttribute('open', '');
  await page.keyboard.press('Escape');
  await expect(menu).not.toHaveAttribute('open', '');
  await expect(menu.locator('summary')).toBeFocused();
  await menu.locator('summary').click();
  await menu.getByRole('link', { name: 'Artigos', exact: true }).click();
  await expect(page).toHaveURL(/\/artigos\/?$/);
  await page.goto('/artigos/entra-agentid-accesspackage');
  const toc = page.locator('[data-article-toc]');
  await expect(toc).not.toHaveAttribute('open', '');
  await toc.locator('summary').click();
  await expect(toc.getByRole('navigation')).toBeVisible();
  const firstSection = toc.locator('a').first();
  const target = await firstSection.getAttribute('href');
  if (!target) throw new Error('The article outline is missing its section target');
  const targetURL = new URL(target, page.url()).href;
  await firstSection.click();
  await expect(page).toHaveURL(targetURL);
});

test('themes persist, both palettes meet normal-text contrast, and keyboard users can skip navigation', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  for (const theme of ['light', 'dark']) {
    await page.evaluate((value) => {
      document.documentElement.setAttribute('data-theme', value);
      localStorage.setItem('theme', value);
    }, theme);
    const contrasts = await page.evaluate(() => {
      const styles = getComputedStyle(document.documentElement);
      const luminance = (token: string): number => {
        const hex = styles.getPropertyValue(token).trim().replace('#', '');
        const channels = [0, 2, 4].map((index) => {
          const channel = parseInt(hex.slice(index, index + 2), 16) / 255;
          return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
        });
        return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
      };
      return [
        ['--color-text', '--color-bg'],
        ['--color-text-muted', '--color-bg'],
        ['--color-text-muted', '--color-surface-alt'],
        ['--color-primary', '--color-bg'],
        ['--color-primary-fg', '--color-primary'],
      ].map(([foreground, background]) => {
        const a = luminance(foreground);
        const b = luminance(background);
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      });
    });
    contrasts.forEach((ratio) => expect(ratio, `${theme} contrast`).toBeGreaterThanOrEqual(4.5));
  }
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Alternar tema' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('focused skip links meet normal-text contrast in both themes', async ({ page }) => {
  for (const theme of ['light', 'dark']) {
    await page.goto('/');
    await page.evaluate((value) => document.documentElement.setAttribute('data-theme', value), theme);
    const link = page.getByRole('link', { name: 'Pular para o conteúdo', exact: true });
    await link.focus();
    await expect(link).toBeVisible();
    const ratio = await link.evaluate((element) => {
      const style = getComputedStyle(element);
      const luminance = (color: string): number => {
        const channels = color.match(/[\d.]+/g)?.slice(0, 3).map(Number);
        if (!channels || channels.length !== 3 || !channels.every(Number.isFinite)) {
          throw new Error(`Unexpected computed color: ${color}`);
        }
        const linear = channels.map((value) => {
          const channel = value / 255;
          return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
        });
        return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
      };
      const foreground = luminance(style.color);
      const background = luminance(style.backgroundColor);
      return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
    });
    expect(ratio, `${theme} focused skip link`).toBeGreaterThanOrEqual(4.5);
  }
});

test('content and native navigation remain available without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4431/artigos');
    expect(await page.locator('[data-filter-item]').count()).toBeGreaterThan(0);
    await expect(page.locator('[data-article-filters]')).toBeHidden();
    await page.goto('http://127.0.0.1:4431/artigos/entra-agentid-accesspackage');
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('.article-body')).toContainText('Motivação');
    await page.locator('[data-article-toc] summary').click();
    await expect(page.locator('[data-article-toc] nav')).toBeVisible();
  } finally {
    await context.close();
  }
});

for (const [path, term, prefix] of [
  ['/buscar', 'autorização', '/artigos/'],
  ['/en/search', 'identity', '/en/articles/'],
]) {
  test(`full-text search respects locale and accepts a query string (${path})`, async ({ page }) => {
    await page.goto(`${path}?q=${encodeURIComponent(term)}`);
    const results = page.locator('.pagefind-ui__result-link');
    await expect(results.first()).toBeVisible({ timeout: 15_000 });
    for (const link of await results.all()) {
      await expect(link).toHaveAttribute('href', new RegExp(`^${prefix}`));
    }
    await expect(page.locator('[data-search-unavailable]')).toBeHidden();
  });
}

test('search has an explicit error state when its UI asset cannot load', async ({ page }) => {
  await page.route('**/pagefind/pagefind-ui.js', (route) => route.abort());
  await page.goto('/buscar');
  await expect(page.locator('[data-search-unavailable]')).toBeVisible();
  await expect(page.getByRole('link', { name: '← Todos os artigos' })).toHaveAttribute('href', '/artigos');
});

test('reduced-motion users do not get presentation animations', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('.is-entering')).toHaveCount(0);
  const duration = await page.locator('.hero-copy').evaluate((element) => getComputedStyle(element).animationDuration);
  expect(parseFloat(duration)).toBeLessThanOrEqual(0.001);
});

test('localized metadata excludes the other language but preserves shared Markdown and images', () => {
  const body = `:::lang{pt}
# Título
![Capa](/pt.png)
${'palavra '.repeat(200)}
:::

:::lang{en}
![Cover](/en.png)
${'word '.repeat(600)}
:::

${'shared '.repeat(200)}`;
  expect(getArticleDetails(body, 'pt').image?.src).toBe('/pt.png');
  expect(getArticleDetails(body, 'en').image?.src).toBe('/en.png');
  expect(getArticleDetails(body, 'pt').readingMinutes).toBe(3);
  expect(getArticleDetails(body, 'en').readingMinutes).toBe(4);
  expect(formatArticleDate(new Date('2026-09-05T00:00:00Z'), 'pt')).toMatch(/^5 /);
});

test('HTML preparation preserves nested content and anchors while removing duplicate chrome', () => {
  const source = `<div data-lang="pt"><h1 id="titulo"><a href="#titulo">Título</a></h1><h2 id="conteudo">Conteúdo</h2><ol><li><a href="#secao">Seção</a></li></ol><div><h2 id="secao">Seção <code>técnica</code></h2><p>Texto neutro</p><table><tr><td>Valor</td></tr></table></div></div><div data-lang="en"><h2 id="english">English</h2></div><p>Shared</p>`;
  const result = prepareArticleHtml(source, 'pt', 'Título', 'Tabela');
  expect(result.titleId).toBe('titulo');
  expect(result.headings).toEqual([{ id: 'secao', text: 'Seção técnica' }]);
  expect(result.html).toContain('Texto neutro');
  expect(result.html).toContain('Shared');
  expect(result.html).toContain('class="table-scroll"');
  expect(result.html).not.toContain('English');
  expect(result.html).not.toContain('<h1');
  expect(result.html).not.toContain('id="conteudo"');
});

test('the editorial title is not repeated when the body and metadata use different wording', () => {
  const result = prepareArticleHtml('<h1 id="original">Título editorial completo</h1><h2 id="intro">Introdução</h2>', 'pt', 'Título resumido', 'Tabela');
  expect(result.titleId).toBe('original');
  expect(result.html).not.toContain('Título editorial completo');
  expect(result.headings).toEqual([{ id: 'intro', text: 'Introdução' }]);
});

test('presentation routes load no more than 30 KiB gzip of JavaScript per page', async ({ browser, baseURL }) => {
  for (const path of ['/', '/en/', '/artigos', '/en/articles', '/artigos/entra-agentid-accesspackage']) {
    const context = await browser.newContext({ baseURL });
    try {
      const page = await context.newPage();
      const responses: Promise<{ status: number; size: number }>[] = [];
      page.on('response', (response) => {
        if (response.request().resourceType() === 'script') {
          responses.push(response.body().then((body) => ({
            status: response.status(),
            size: gzipSync(body).byteLength,
          })));
        }
      });
      await page.goto(path, { waitUntil: 'networkidle' });
      const scripts = await Promise.all(responses);
      expect(scripts.length).toBeGreaterThan(0);
      scripts.forEach(({ status }) => expect(status).toBe(200));
      expect(scripts.reduce((total, { size }) => total + size, 0), path).toBeLessThanOrEqual(30 * 1024);
    } finally {
      await context.close();
    }
  }
});
