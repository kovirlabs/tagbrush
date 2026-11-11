import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { readdirSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { check } from '../bin/tagbrush.mjs';
const fileUrl = (path) => pathToFileURL(resolve(path)).href;
const DEMO = fileUrl('index.html');

// The demo links the Tag family brand (kovirlabs.github.io/tagstack/brand.css
// and mark.svg) for its family bar and footer. Leave it out, so these tests
// see TagBrush.css alone and don't change when the brand does.
test.beforeEach(async ({ page }) => {
  await page.route(/kovirlabs\.github\.io\/tagstack\//, (route) => route.abort());
});

// Resolves a color expression such as 'var(--color-surface)' the way the
// browser computes it inside `within` (also inside its shadow root, if any).
const token = (page, value, within = 'body') =>
  page.locator(within).first().evaluate((el, value) => {
    const probe = document.createElement('i');
    probe.style.color = value;
    (el.shadowRoot ?? el).append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, value);

const style = (page, selector, prop, pseudo = null) =>
  page.locator(selector).first().evaluate(
    (el, [prop, pseudo]) => getComputedStyle(el, pseudo)[prop],
    [prop, pseudo],
  );

test.describe('cascade and defaults', () => {
  test.beforeEach(async ({ page }) => {
    // Reduced motion sets --transition-duration to 0s, so color changes apply instantly.
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await page.goto(DEMO);
  });

  test('element rules are not overridden by lower-specificity helpers', async ({ page }) => {
    expect(await style(page, 'nav ul', 'paddingLeft')).toBe('0px');
    expect(await style(page, '#theme-select', 'marginBottom')).toBe('0px');
    expect(await style(page, 'pre code', 'backgroundColor')).toBe('rgba(0, 0, 0, 0)');
    expect(await style(page, 'label:has(> input[type=checkbox])', 'display')).toBe('flex');
    expect(await style(page, '#showcase ~ h3', 'marginTop')).toBe('32px');
  });

  test('form fields are spaced and help text attaches to its field', async ({ page }) => {
    expect(await style(page, '#name', 'marginBottom')).toBe('16px');
    expect(await style(page, '#message', 'marginBottom')).toBe('0px');
    expect(await style(page, '#message + small', 'marginBottom')).toBe('16px');
    expect(await style(page, '#site-search', 'marginBottom')).toBe('0px');
    expect(await style(page, '#site-search', 'flexGrow')).toBe('1');
  });

  test('buttons and variants', async ({ page }) => {
    const surface = await token(page, 'var(--color-surface)');
    expect(await style(page, 'button.secondary', 'backgroundColor')).toBe(surface);
    expect(await style(page, 'button[type=reset]', 'backgroundColor')).toBe(surface);
    expect(await style(page, 'button.outline', 'borderTopColor')).toBe('rgb(37, 99, 235)');
  });

  test('nav lists, current page, and menu toolbars', async ({ page }) => {
    expect(await style(page, 'nav[aria-label="Example site"] ul', 'display')).toBe('flex');
    expect(await style(page, 'nav[aria-label="Example site"] [aria-current="page"]', 'fontWeight')).toBe('600');
    expect(await style(page, 'nav[aria-label="Example site"] [aria-current="page"]', 'color')).toBe(await token(page, 'var(--color-text)'));
    expect(await style(page, '#nav-demo menu', 'display')).toBe('flex');
    expect(await style(page, '#nav-demo menu', 'listStyleType')).toBe('none');
  });

  test('validation states', async ({ page }) => {
    expect(await style(page, '#website', 'borderTopColor')).toBe('rgb(220, 38, 38)');
    expect(await style(page, '#username', 'borderTopColor')).toBe('rgb(22, 163, 74)');
  });

  test('user CSS outside the layer always wins', async ({ page }) => {
    await page.addStyleTag({ content: 'button { border-radius: 0; } a { color: rgb(1, 2, 3); }' });
    expect(await style(page, '#open-dialog', 'borderTopLeftRadius')).toBe('0px');
    expect(await style(page, 'p a', 'color')).toBe('rgb(1, 2, 3)');
  });

  test('derived colors follow --color-primary, even when set on a nested element', async ({ page }) => {
    await page.locator('#open-dialog').evaluate((el) => el.parentElement.style.setProperty('--color-primary', 'rgb(16, 185, 129)'));
    expect(await style(page, '#open-dialog', 'borderTopColor')).toBe('rgb(16, 185, 129)');
  });

  test('spacing and component tokens cascade from one variable', async ({ page }) => {
    await page.addStyleTag({ content: ':root { --spacing: 2rem; --button-radius: 999px; }' });
    expect(await style(page, '#name', 'marginBottom')).toBe('32px');
    expect(await style(page, '#open-dialog', 'borderTopLeftRadius')).toBe('999px');
    expect(await style(page, '#name', 'borderTopLeftRadius')).toBe('6px');
  });
});

test.describe('color schemes', () => {
  test('follows the system dark preference', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(DEMO);
    const background = await style(page, 'body', 'backgroundColor');
    expect(background).toBe(await token(page, 'var(--color-background)'));
    expect(background).not.toBe('rgb(255, 255, 255)');
  });

  test('data-theme forces a scheme on a subtree', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto(DEMO);
    const dark = await style(page, '.card[data-theme=dark] .muted', 'color');
    const light = await style(page, '.card[data-theme=light] .muted', 'color');
    expect(dark).toBe(await token(page, 'var(--color-text-muted)', '.card[data-theme=dark]'));
    expect(light).toBe(await token(page, 'var(--color-text-muted)', '.card[data-theme=light]'));
    expect(dark).not.toBe(light);
  });

  test('switcher on the demo page sets data-theme on <html>', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto(DEMO);
    const before = await style(page, 'body', 'backgroundColor');
    await page.selectOption('#theme-select', 'dark');
    expect(await style(page, 'body', 'backgroundColor')).not.toBe(before);
    expect(await style(page, 'body', 'backgroundColor')).toBe(await token(page, 'var(--color-background)'));
  });
});

test.describe('layout', () => {
  for (const width of [360, 768, 1280]) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(DEMO);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBe(0);
    });
  }

  test('dialog and popover open', async ({ page }) => {
    await page.goto(DEMO);
    await page.click('#open-dialog');
    await expect(page.locator('#demo-dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await page.click('[popovertarget=demo-popover]');
    await expect(page.locator('#demo-popover')).toBeVisible();
  });
});

test.describe('build output', () => {
  const PROPS = ['color', 'backgroundColor', 'marginBottom', 'paddingLeft', 'borderTopColor', 'borderTopLeftRadius', 'fontFamily', 'display'];
  const SELECTORS = ['body', 'h2', 'nav ul', 'p a', 'button', 'button.secondary', 'button.outline', '#name', '#topic', '#website', 'blockquote', 'pre', 'kbd', 'table', '.card', 'details', 'meter'];

  const snapshotStyles = (page) => page.evaluate(([selectors, props]) =>
    Object.fromEntries(selectors.map((sel) => {
      const cs = getComputedStyle(document.querySelector(sel));
      return [sel, Object.fromEntries(props.map((p) => [p, cs[p]]))];
    })), [SELECTORS, PROPS]);

  test('minified file renders identically to the source', async ({ page }) => {
    // Reduced motion makes transitions instant, so swapping stylesheets doesn't
    // leave buttons and inputs mid-transition from the browser's default colors.
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await page.goto(DEMO);
    const source = await snapshotStyles(page);
    await page.evaluate(() => new Promise((done) => {
      const link = document.querySelector('link[href="tagbrush.css"]');
      link.addEventListener('load', done, { once: true });
      link.href = 'tagbrush.min.css';
    }));
    expect(await snapshotStyles(page)).toEqual(source);
  });

  test('inline SVGs keep their proportions when they shrink', async ({ page }) => {
    await page.goto(fileUrl('tests/fixtures/svg.html'));
    const size = (id) => page.locator(`#${id}`).evaluate((el) => {
      const r = el.getBoundingClientRect();
      return `${Math.round(r.width)}x${Math.round(r.height)}`;
    });
    expect(await size('wide')).toBe('360x90');
    expect(await size('icon')).toBe('24x24');
    expect(await size('height-only')).toBe('48x24');
    expect(await size('no-viewbox')).toBe('360x300');
    expect(await size('stretch')).toBe('360x120');
    expect(await size('css')).toBe('48x12');
  });

  test('scoped build only styles inside .tagbrush', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await page.goto(fileUrl('tests/fixtures/scoped.html'));
    expect(await style(page, '#inside', 'backgroundColor')).toBe('rgb(37, 99, 235)');
    expect(await style(page, '#inside-input', 'display')).toBe('block');
    expect(await style(page, '#scope', 'fontFamily')).toContain('system-ui');
    expect(await style(page, '#outside', 'backgroundColor')).not.toBe('rgb(37, 99, 235)');
    expect(await style(page, 'body', 'marginTop')).toBe('8px');
  });

  test('shadow build styles a shadow root through :host', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await page.goto(fileUrl('tests/fixtures/shadow.html'));
    await page.evaluate(() => Promise.all([...document.querySelectorAll('tb-demo')].map((el) => el.ready)));
    // Playwright locators pierce open shadow roots.
    expect(await style(page, '#light-host button', 'backgroundColor')).toBe('rgb(37, 99, 235)');
    expect(await style(page, '#light-host input', 'display')).toBe('block');
    expect(await style(page, '#light-host main', 'paddingTop')).toBe('24px');
    expect(await style(page, '#light-host', 'display')).toBe('block');
    expect(await style(page, '#light-host', 'fontFamily')).toContain('system-ui');
    expect(await style(page, '#light-host', 'backgroundColor')).toBe('rgb(255, 255, 255)');
    expect(await style(page, '#dark-host', 'backgroundColor')).toBe(await token(page, 'var(--color-background)', '#dark-host'));
    expect(await style(page, '#dark-host', 'backgroundColor')).not.toBe('rgb(255, 255, 255)');
    // Page CSS aimed at the host element beats the :host defaults inside the shadow root.
    await page.addStyleTag({ content: '#light-host { --color-primary: rgb(16, 185, 129); }' });
    expect(await style(page, '#light-host button', 'backgroundColor')).toBe('rgb(16, 185, 129)');
    expect(await style(page, '#outside', 'backgroundColor')).not.toBe('rgb(37, 99, 235)');
    expect(await style(page, 'body', 'marginTop')).toBe('8px');
  });
});

test.describe('page layout', () => {
  // At 1280px wide, centered content starts (1280 - 1200) / 2 + 16 = 56px from each side.
  const WIDE = { width: 1280, height: 800 };
  const PAGE = '<header><nav><a href="#">Site</a></nav></header><main><h1>Title</h1><p>Text</p></main><footer><p>Footer</p></footer>';

  const load = async (page, html, { size = WIDE, bodyAttrs = {} } = {}) => {
    await page.setViewportSize(size);
    await page.goto(fileUrl('tests/fixtures/layout.html'));
    await page.evaluate(([html, attrs]) => {
      document.body.innerHTML = html;
      for (const [name, value] of Object.entries(attrs)) document.body.setAttribute(name, value);
    }, [html, bodyAttrs]);
  };
  const rect = (page, selector) => page.locator(selector).first().evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { left: Math.round(r.left), width: Math.round(r.width), bottom: Math.round(r.bottom) };
  });

  test('header, main and footer span the page and center their content', async ({ page }) => {
    await load(page, PAGE);
    for (const sel of ['body > header', 'body > main', 'body > footer']) {
      expect(await rect(page, sel)).toMatchObject({ left: 0, width: 1280 });
      expect(await style(page, sel, 'paddingLeft')).toBe('56px');
      expect(await style(page, sel, 'paddingRight')).toBe('56px');
    }
    expect(await style(page, 'body', 'paddingLeft')).toBe('0px');
  });

  test('narrow screens keep the container padding', async ({ page }) => {
    await load(page, PAGE, { size: { width: 360, height: 800 } });
    expect(await style(page, 'body > main', 'paddingLeft')).toBe('16px');
  });

  test('--container-max-width and --container-padding still control the width', async ({ page }) => {
    await load(page, PAGE);
    await page.addStyleTag({ content: ':root { --container-max-width: 800px; --container-padding: 2rem; }' });
    // (1280 - 800) / 2 + 32
    expect(await style(page, 'body > main', 'paddingLeft')).toBe('272px');
  });

  test('the footer sits at the bottom of a short page', async ({ page }) => {
    await load(page, PAGE);
    expect(await style(page, 'body', 'display')).toBe('flex');
    expect((await rect(page, 'body > footer')).bottom).toBe(WIDE.height);
  });

  // 70ch in the body font, measured in the page.
  const readingWidth = (page) => page.evaluate(() => {
    const probe = document.body.appendChild(document.createElement('div'));
    probe.style.width = '70ch';
    const width = probe.getBoundingClientRect().width;
    probe.remove();
    return width;
  });

  test('a page without <main> is centered at a comfortable reading width', async ({ page }) => {
    await load(page, '<h1>Markdown title</h1><p>Paragraph</p><pre>code</pre>');
    const width = await readingWidth(page);
    expect(await style(page, 'body', 'display')).toBe('block');
    const pre = await page.locator('pre').evaluate((el) => el.getBoundingClientRect());
    expect(Math.abs(pre.width - width)).toBeLessThan(1);
    expect(Math.abs(pre.left - (WIDE.width - width) / 2)).toBeLessThan(1);
  });

  test('--reading-width can widen text pages', async ({ page }) => {
    await load(page, '<p>Paragraph</p>');
    await page.addStyleTag({ content: ':root { --reading-width: 1168px; }' });
    expect(await style(page, 'body', 'paddingLeft')).toBe('56px');
  });

  test('a single article in main is kept at reading width', async ({ page }) => {
    await load(page, '<main><article><h1>Post</h1><p>Text</p></article></main>');
    const width = await readingWidth(page);
    const article = await page.locator('article').evaluate((el) => el.getBoundingClientRect());
    expect(Math.abs(article.width - width)).toBeLessThan(1);
    expect(Math.abs(article.left - (WIDE.width - width) / 2)).toBeLessThan(1);

    await load(page, '<main><article><p>One</p></article><article><p>Two</p></article></main>');
    expect((await rect(page, 'article')).width).toBe(1168);

    await load(page, '<main><article data-layout="full"><p>Wide</p></article></main>');
    expect((await rect(page, 'article')).width).toBe(1168);
  });

  test('a classless framework wrapper counts as the page', async ({ page }) => {
    await load(page, `<div id="root">${PAGE}</div><script></script>`);
    expect(await style(page, '#root > main', 'paddingLeft')).toBe('56px');
    expect(await style(page, '#root > main', 'paddingTop')).toBe('24px');
    expect(await style(page, 'body', 'paddingLeft')).toBe('0px');
    expect((await rect(page, '#root > footer')).bottom).toBe(WIDE.height);
  });

  test('a custom element wrapper such as Angular\'s <app-root> counts as the page', async ({ page }) => {
    await load(page, `<app-root>${PAGE}</app-root>`);
    expect(await style(page, 'app-root > main', 'paddingLeft')).toBe('56px');
    expect((await rect(page, 'app-root > footer')).bottom).toBe(WIDE.height);
  });

  test('a wrapper made invisible with display: contents still works', async ({ page }) => {
    await load(page, `<div style="display: contents">${PAGE}</div>`);
    expect(await style(page, 'main', 'paddingLeft')).toBe('56px');
    expect((await rect(page, 'footer')).bottom).toBe(WIDE.height);
  });

  test('existing .container markup looks the same as before', async ({ page }) => {
    await load(page, '<header><nav class="container"><a href="#">Site</a></nav></header><main class="container"><p>Text</p></main>');
    expect(await style(page, 'body > header', 'paddingLeft')).toBe('0px');
    expect(await rect(page, 'nav')).toMatchObject({ left: 40, width: 1200 });
    expect(await rect(page, 'main')).toMatchObject({ left: 40, width: 1200 });
    expect(await style(page, 'main', 'paddingLeft')).toBe('16px');

    await load(page, '<div class="container"><h1>Title</h1></div>');
    expect(await style(page, 'body', 'paddingLeft')).toBe('0px');
  });

  test('nested header and footer elements are not treated as the page header', async ({ page }) => {
    await load(page, '<main><article><header><h2>Post</h2></header><footer>Posted today</footer></article><blockquote><p>Quote</p><footer>Someone</footer></blockquote></main>');
    expect(await style(page, 'article > header', 'paddingLeft')).toBe('0px');
    expect(await style(page, 'article > footer', 'paddingLeft')).toBe('0px');
    expect(await style(page, 'blockquote > footer', 'paddingLeft')).toBe('0px');
  });

  test('data-layout="full" turns the layout off for the page or one landmark', async ({ page }) => {
    await load(page, PAGE, { bodyAttrs: { 'data-layout': 'full' } });
    expect(await style(page, 'body', 'display')).toBe('block');
    expect(await style(page, 'body > main', 'paddingLeft')).toBe('0px');

    await load(page, '<p>Loose content</p>', { bodyAttrs: { 'data-layout': 'full' } });
    expect(await style(page, 'body', 'paddingLeft')).toBe('0px');

    await load(page, PAGE.replace('<header>', '<header data-layout="full">'));
    expect(await style(page, 'body > header', 'paddingLeft')).toBe('0px');
    expect(await style(page, 'body > main', 'paddingLeft')).toBe('56px');
  });

  test('previous/next links sit at opposite ends of their row', async ({ page }) => {
    await load(page, '<main><nav aria-label="Pagination"><ul><li><a rel="prev" href="#">Previous</a></li><li><a rel="next" href="#">Next</a></li></ul></nav></main>');
    const nav = await rect(page, 'nav');
    const next = await page.locator('a[rel=next]').evaluate((el) => el.getBoundingClientRect().right);
    expect(Math.round(next)).toBe(nav.left + nav.width);
    expect((await rect(page, 'a[rel=prev]')).left).toBe(nav.left);
  });

  test('a visually hidden label in a scrolling table does not widen the page', async ({ page }) => {
    const row = Array.from({ length: 8 }, (_, i) => `<th>Column ${i} heading</th>`).join('');
    for (const html of [`<main><table><tr>${row}<th><span class="visually-hidden">Actions</span></th></tr></table></main>`,
      `<main><figure><table><tr>${row}<th><span class="visually-hidden">Actions</span></th></tr></table></figure></main>`]) {
      await load(page, html, { size: { width: 360, height: 800 } });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(360);
    }
  });

  test('a class on the wrapper means it is the author\'s own layout', async ({ page }) => {
    await load(page, `<div class="grid">${PAGE}</div>`);
    expect(await style(page, 'main', 'paddingLeft')).toBe('0px');
    expect(await style(page, '.grid', 'display')).toBe('grid');
  });
});

test.describe('semantic components', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'no-preference' });
    await page.goto(DEMO);
  });

  test('role="switch" checkboxes render as a toggle', async ({ page }) => {
    const on = 'input[role=switch]:checked';
    const off = 'input[role=switch]:not(:checked)';
    expect(await style(page, on, 'appearance')).toBe('none');
    expect(await style(page, on, 'width')).toBe('36px');
    expect(await style(page, on, 'backgroundColor')).toBe('rgb(37, 99, 235)');
    expect(await style(page, off, 'backgroundColor')).toBe(await token(page, 'var(--color-text-muted)'));
    expect(await style(page, on, 'backgroundPositionX')).toBe('100%');
    expect(await style(page, off, 'backgroundPositionX')).toBe('0px');
    // Plain checkboxes are unchanged.
    expect(await style(page, 'input[type=checkbox]:not([role])', 'appearance')).not.toBe('none');
  });

  test('aria-busy shows a spinner', async ({ page }) => {
    expect(await style(page, 'button[aria-busy=true]', 'animationName', '::before')).toBe('tagbrush-spin');
    expect(await style(page, 'button[aria-busy=true]', 'marginInlineEnd', '::before')).toBe('8px');
    expect(await style(page, 'button[aria-busy=true]:empty', 'marginInlineEnd', '::before')).toBe('0px');
    expect(await style(page, 'button[aria-busy=true]', 'cursor')).toBe('progress');
    expect(await style(page, 'button:not([aria-busy])', 'content', '::before')).toBe('none');
  });

  test('the spinner slows down with reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(await style(page, 'button[aria-busy=true]', 'animationDuration', '::before')).toBe('2s');
  });

  test('breadcrumbs get separators', async ({ page }) => {
    const crumbs = 'nav[aria-label=Breadcrumb]';
    expect(await style(page, `${crumbs} li + li`, 'content', '::before')).toMatch(/^"\/"/);
    expect(await style(page, `${crumbs} li:first-child`, 'content', '::before')).toBe('none');
    expect(await style(page, `${crumbs} ol`, 'columnGap')).toBe('8px');
    expect(await style(page, `${crumbs} [aria-current]`, 'fontWeight')).toBe('400');
  });

  test('dialog header and footer', async ({ page }) => {
    await page.click('#open-dialog');
    expect(await style(page, '#demo-dialog header', 'display')).toBe('flex');
    expect(await style(page, '#demo-dialog header', 'justifyContent')).toBe('space-between');
    expect(await style(page, '#demo-dialog h3', 'marginBottom')).toBe('0px');
    expect(await style(page, '#demo-dialog footer', 'display')).toBe('flex');
    expect(await style(page, '#demo-dialog footer', 'justifyContent')).toBe('flex-end');
    expect(await style(page, '#demo-dialog footer', 'fontSize')).toBe('16px');
  });

  test('a modal dialog stops the page behind it from scrolling, without shifting it; a non-modal one does not', async ({ page }) => {
    const width = () => page.evaluate(() => document.body.getBoundingClientRect().width);
    const overflow = () => page.evaluate(() => getComputedStyle(document.documentElement).overflowY);
    expect(await style(page, 'html', 'scrollbarGutter')).toBe('stable');
    const before = await width();
    expect(await overflow()).toBe('visible');
    await page.evaluate(() => document.querySelector('#demo-dialog').showModal());
    expect(await overflow()).toBe('hidden');
    expect(await width()).toBe(before);
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(100);
    expect(await page.evaluate(() => scrollY)).toBe(0);
    await page.evaluate(() => { const d = document.querySelector('#demo-dialog'); d.close(); d.show(); });
    expect(await overflow()).toBe('visible');
    await page.evaluate(() => document.querySelector('#demo-dialog').close());
  });

  test('neighboring details join into an accordion', async ({ page }) => {
    const first = 'details[name=faq]:has(+ details)';
    expect(await style(page, first, 'marginBottom')).toBe('0px');
    expect(await style(page, first, 'borderBottomLeftRadius')).toBe('0px');
    expect(await style(page, 'details + details', 'borderTopWidth')).toBe('0px');
    expect(await style(page, 'details:not(:has(+ details)):not(details + details)', 'marginBottom')).toBe('16px');
  });

  test('a details marker is a chevron: at the start, or at the end in an accordion', async ({ page }) => {
    const single = 'details:not(:has(+ details)):not(details + details)';
    const accordion = 'details[name=faq]';
    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(await style(page, `${single} > summary`, 'listStyleType')).toBe('none');
    expect(await style(page, `${single} > summary`, 'borderRightStyle', '::before')).toBe('solid');
    expect(await style(page, `${single} > summary`, 'position', '::before')).toBe('static');
    expect(await style(page, `${single} > summary`, 'rotate', '::before')).toBe('-45deg');
    await page.locator(`${single} > summary`).click();
    expect(await style(page, `${single} > summary`, 'rotate', '::before')).toBe('45deg');
    expect(await style(page, `${accordion} > summary`, 'position', '::before')).toBe('absolute');
    const [summary, chevron] = await page.locator(`${accordion} > summary`).first().evaluate((el) => [el.getBoundingClientRect().right, parseFloat(getComputedStyle(el, '::before').insetInlineEnd)]);
    expect(summary).toBeGreaterThan(300);
    expect(chevron).toBeLessThan(10);
  });

  test('a details eases open where ::details-content can animate, and opens at once with reduced motion', async ({ page, browserName }) => {
    const supported = await page.evaluate(() => CSS.supports('selector(::details-content)') && CSS.supports('interpolate-size: allow-keywords'));
    test.skip(!supported, `${browserName} opens details at once (no interpolate-size)`);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    // Right after opening, the content is still shorter than it will be.
    const running = () => page.locator('details[name=faq]').nth(1).evaluate(async (el) => {
      el.open = true;
      const height = () => parseFloat(getComputedStyle(el, '::details-content').blockSize);
      const start = height();
      await new Promise((resolve) => setTimeout(resolve, 400));
      return start < height();
    });
    expect(await running()).toBe(true);
    await page.locator('details[name=faq]').nth(1).evaluate((el) => { el.open = false; });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(50);
    expect(await running()).toBe(false);
  });
});

test.describe('form finishing touches', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await page.goto(DEMO);
  });

  test('a textarea without rows grows with its content', async ({ page }) => {
    const supported = await page.evaluate(() => CSS.supports('field-sizing', 'content'));
    test.skip(!supported, 'This browser does not support field-sizing yet');
    const height = () => page.locator('#message').evaluate((el) => el.getBoundingClientRect().height);
    const empty = await height();
    expect(empty).toBeGreaterThanOrEqual(90);
    await page.fill('#message', 'one\ntwo\nthree\nfour\nfive\nsix');
    expect(await height()).toBeGreaterThan(empty);
  });

  test('a textarea with rows keeps its size', async ({ page }) => {
    await page.evaluate(() => document.querySelector('#message').setAttribute('rows', '2'));
    expect(await style(page, '#message', 'fieldSizing')).not.toBe('content');
  });

  test('read-only fields look fixed but keep readable text', async ({ page }) => {
    expect(await style(page, '#readonly-input', 'backgroundColor')).toBe(await token(page, 'var(--color-surface)'));
    expect(await style(page, '#readonly-input', 'color')).toBe(await token(page, 'var(--color-text)'));
    expect(await style(page, '#name', 'backgroundColor')).toBe('rgb(255, 255, 255)');
  });

  test('the caret uses the theme color', async ({ page }) => {
    // The link color: the primary blue, darkened to OKLCH lightness 0.5 in light mode.
    expect(await style(page, '#name', 'caretColor')).toMatch(/^oklch\(0\.5 [\d.]+ 262\.\d+\)$/);
  });

  test('the select arrow is drawn in the muted text color', async ({ page }) => {
    const muted = await token(page, 'var(--color-text-muted)');
    // Where the themed picker is supported, its own icon is the arrow
    if (await style(page, '#topic', 'appearance') === 'base-select') {
      expect(await style(page, '#topic', 'color', '::picker-icon')).toBe(muted);
      return;
    }
    const image = await style(page, '#topic', 'backgroundImage');
    expect(image).toContain('linear-gradient');
    expect(image).toContain(muted);
  });
});

test.describe('automatic contrast', () => {
  test('button text is white on dark primaries and black on light ones', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await page.goto(DEMO);
    const text = async (primary) => {
      await page.evaluate((value) => document.documentElement.style.setProperty('--color-primary', value), primary);
      return style(page, '#demo-button', 'color');
    };
    expect(await text('#1e3a8a')).toMatch(/^(oklch\(1 0 0\)|rgb\(255, 255, 255\))$/);
    expect(await text('#facc15')).toMatch(/^(oklch\(0 0 0\)|rgb\(0, 0, 0\))$/);
  });

  test('a primary written with light-dark() still works', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    await page.goto(DEMO);
    await page.evaluate(() => document.documentElement.style.setProperty('--color-primary', 'light-dark(#047857, #34d399)'));
    const button = '#demo-button';
    expect(await style(page, button, 'backgroundColor')).toBe('rgb(52, 211, 153)');
    // #34d399 is light, so the text is black rather than inheriting the page text color.
    expect(await style(page, button, 'color')).toMatch(/^(oklch\(0 0 0\)|rgb\(0, 0, 0\))$/);
  });

  test('--color-on-primary still overrides the automatic text color', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' }); // no color transition on a visible button
    await page.goto(DEMO);
    await page.addStyleTag({ content: ':root { --color-on-primary: rgb(1, 2, 3); }' });
    expect(await style(page, '#demo-button', 'color')).toBe('rgb(1, 2, 3)');
  });
});

test.describe('theme builder', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  });

  test('a shared link restores the theme', async ({ page }) => {
    await page.goto(`${DEMO}?primary=f59e0b&font=serif&radius=0.75&pill=1`);
    expect(await page.evaluate(() => document.documentElement.style.getPropertyValue('--color-primary'))).toBe('#f59e0b');
    expect(await page.inputValue('#b-radius')).toBe('0.75');
    expect(await page.isChecked('#b-pill')).toBe(true);
    await expect(page.locator('#b-font option:checked')).toHaveText('Serif');
    await expect(page.locator('#theme-code')).toContainText('--color-primary: #f59e0b;');
  });

  test('changing the theme updates the link, and the defaults clear it', async ({ page }) => {
    await page.goto(DEMO);
    await page.click('[data-primary="#10b981"]');
    expect(new URL(page.url()).search).toBe('?primary=10b981');
    await page.click('#b-reset');
    expect(new URL(page.url()).search).toBe('');
  });

  test('bad values in the link are ignored', async ({ page }) => {
    await page.goto(`${DEMO}?primary=javascript:alert(1)&font=nope`);
    expect(await page.inputValue('#b-primary')).toBe('#7c3aed');
    await expect(page.locator('#theme-code')).toHaveText(':root {\n  --color-primary: #7c3aed;\n  --border-radius: 0.5rem;\n}');
  });

  test('the page starts in the family violet, and the Blue preset shows TagBrush.css\'s defaults', async ({ page }) => {
    await page.goto(DEMO);
    // brand.css (blocked in tests) themes the page until something changes.
    expect(await page.evaluate(() => document.documentElement.style.getPropertyValue('--color-primary'))).toBe('');
    expect(new URL(page.url()).search).toBe('');
    await page.click('[data-primary="#2563eb"]');
    await page.locator('#b-radius').fill('0.375');
    await expect(page.locator('#theme-code')).toHaveText('/* Using the defaults */');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim())).toBe('#2563eb');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--border-radius').trim())).toBe('0.375rem');
  });

  test('the contrast readout passes for every preset', async ({ page }) => {
    await page.goto(DEMO);
    for (const swatch of await page.locator('[data-primary]').all()) {
      await swatch.click();
      await expect(page.locator('#b-contrast')).toContainText('Button text');
      await expect(page.locator('#b-contrast')).not.toContainText('below');
    }
  });
});

test.describe('markdown output', () => {
  const MARKDOWN = fileUrl('tests/fixtures/markdown.html');

  for (const width of [360, 1280]) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(MARKDOWN);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBe(0);
    });
  }

  test('wide tables scroll inside themselves and stay tables for assistive tech', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 900 });
    await page.goto(MARKDOWN);
    const box = await page.locator('#wide-table').evaluate((el) => ({ scroll: el.scrollWidth, client: el.clientWidth }));
    expect(box.client).toBe(328);
    expect(box.scroll).toBeGreaterThan(box.client);
    await expect(page.getByRole('table')).toHaveCount(2);
    await expect(page.getByRole('columnheader', { name: 'Environment variable' })).toHaveCount(1);
  });

  test('narrow tables are as wide as their content; tables in a figure fill it', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(MARKDOWN);
    const width = (sel) => page.locator(sel).first().evaluate((el) => el.getBoundingClientRect().width);
    expect(await width('table')).toBeLessThan(400);
    await page.goto(DEMO);
    expect(await width('figure > table')).toBe(await width('figure:has(> table)'));
  });

  test('column alignment from Markdown is kept', async ({ page }) => {
    await page.goto(MARKDOWN);
    // Browsers report the align attribute as -webkit-center / -moz-center.
    expect(await style(page, 'th[align=center]', 'textAlign')).toMatch(/center$/);
    expect(await style(page, 'td[align=right]', 'textAlign')).toMatch(/right$/);
    expect(await style(page, 'td:not([align])', 'textAlign')).toBe('start');
  });

  test('task list checkboxes replace the bullet', async ({ page }) => {
    await page.goto(MARKDOWN);
    expect(await style(page, '.task-list-item', 'listStyleType')).toBe('none');
    expect(await style(page, 'li:has(> input:not([class]))', 'listStyleType')).toBe('none');
    expect(await style(page, 'li:not(:has(input))', 'listStyleType')).toBe('disc');
  });

  test('footnotes are set apart in smaller text', async ({ page }) => {
    await page.goto(MARKDOWN);
    expect(await style(page, '[data-footnotes]', 'fontSize')).toBe('14px');
    expect(await style(page, '[data-footnotes]', 'marginTop')).toBe('32px');
  });

  test('long words wrap', async ({ page }) => {
    await page.goto(MARKDOWN);
    expect(await style(page, 'p', 'overflowWrap')).toBe('break-word');
  });
});

test.describe('article grid', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 800 });
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto(fileUrl('tests/fixtures/articles.html'));
  });

  test('a section of articles becomes a grid of cards', async ({ page }) => {
    expect(await style(page, '#posts', 'display')).toBe('grid');
    const tops = await page.locator('#posts > article').evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().top)));
    expect(new Set(tops).size).toBe(1);
    expect(await style(page, '#posts > article', 'backgroundColor')).toBe(await token(page, 'var(--color-surface)'));
    expect(await style(page, '#posts > article', 'paddingLeft')).toBe('24px');
    expect(await style(page, '#posts > article > p', 'marginBottom')).toBe('0px');
  });

  test('headings and intro text span the full width above the cards', async ({ page }) => {
    expect(await style(page, '#posts > h2', 'gridColumnStart')).toBe('1');
    expect(await style(page, '#posts > h2', 'gridColumnEnd')).toBe('-1');
    expect(await style(page, '#posts > h2', 'marginBottom')).toBe('0px');
  });

  test('a single article or a mixed section is left alone', async ({ page }) => {
    expect(await style(page, '#single', 'display')).toBe('block');
    expect(await style(page, '#single > article', 'backgroundColor')).toBe('rgba(0, 0, 0, 0)');
    expect(await style(page, '#mixed', 'display')).toBe('block');
  });

  test('two or three cards fill the width even with a heading above them', async ({ page }) => {
    for (const count of [2, 3]) {
      await page.evaluate((n) => {
        const posts = document.querySelector('#posts');
        posts.querySelectorAll('article').forEach((a, i) => { if (i >= n) a.remove(); });
      }, count);
      const widths = await page.locator('#posts > article').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().width));
      const section = await page.locator('#posts').evaluate((el) => el.getBoundingClientRect().width);
      const gap = 24;
      expect(widths).toHaveLength(count);
      for (const width of widths) expect(Math.abs(width - (section - (count - 1) * gap) / count)).toBeLessThan(1);
      await page.reload();
    }
  });

  test('cards wrap to one column on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    const lefts = await page.locator('#posts > article').evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().left)));
    expect(new Set(lefts).size).toBe(1);
  });
});

test.describe('landing patterns', () => {
  const LANDING = fileUrl('tests/fixtures/landing.html');
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 800 });
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto(LANDING);
  });

  test('a skip link stays out of sight until it is focused', async ({ page }) => {
    const bottom = () => page.locator('#skip').evaluate((el) => el.getBoundingClientRect().bottom);
    expect(await bottom()).toBeLessThanOrEqual(0);
    await page.locator('#skip').focus();
    expect(await bottom()).toBeGreaterThan(0);
  });

  test('sections in a full-width main are bands that center their content', async ({ page }) => {
    expect(await style(page, 'main', 'paddingTop')).toBe('0px');
    expect(await style(page, 'main', 'paddingLeft')).toBe('0px');
    expect(await style(page, '#band', 'paddingLeft')).toBe('16px');
    expect(await style(page, '#band', 'paddingTop')).toBe('32px');
    expect(await style(page, '#dark-band', 'marginTop')).toBe('0px');
    await page.setViewportSize({ width: 1600, height: 800 });
    expect(await style(page, '#band', 'paddingLeft')).toBe('216px');
    expect(await style(page, '#dark-band', 'backgroundColor')).not.toBe(await style(page, '#band', 'backgroundColor'));
  });

  test('the header menu sits in the bar on wide screens and behind a button on phones', async ({ page }) => {
    expect(await style(page, '#menu', 'display')).toBe('contents');
    await expect(page.locator('#menu-button')).toBeHidden();
    await expect(page.locator('#menu a').first()).toBeVisible();
    await page.setViewportSize({ width: 390, height: 800 });
    await expect(page.locator('#menu-button')).toBeVisible();
    await expect(page.locator('#menu a').first()).toBeHidden();
    await page.click('#menu-button');
    await expect(page.locator('#menu a').first()).toBeVisible();
    expect(await style(page, '#menu ul', 'flexDirection')).toBe('column');
    // The panel grows in from 97%, so wait for it to settle
    await expect.poll(async () => Math.round((await page.locator('#menu').boundingBox()).width)).toBe(390);
  });

  test('an ordered list of headed items is a numbered timeline', async ({ page }) => {
    expect(await style(page, '#steps', 'listStyleType')).toBe('none');
    expect(await style(page, '#steps > li', 'display')).toBe('grid');
    const numbers = await page.locator('#steps > li').evaluateAll((els) => els.map((el) => getComputedStyle(el, '::before').content));
    expect(numbers).toEqual(['counter(list-item)', 'counter(list-item)', 'counter(list-item)']);
    const left = (sel) => page.locator(sel).evaluate((el) => Math.round(el.getBoundingClientRect().left));
    expect(await left('#steps > li:nth-child(2) > p:last-child')).toBe(await left('#steps > li:nth-child(2) > h3'));
    expect(await style(page, '#plain-list', 'listStyleType')).toBe('decimal');
    expect(await style(page, '#plain-list > li', 'display')).toBe('list-item');
  });

  test('buttons line up at the bottom of a row of cards', async ({ page }) => {
    const top = (sel) => page.locator(sel).evaluate((el) => Math.round(el.getBoundingClientRect().top));
    expect(await top('#short-button')).toBe(await top('#tall-button'));
  });

  test('a picture first in a card runs to its edges', async ({ page }) => {
    const card = await page.locator('#short-card').boundingBox();
    const img = await page.locator('#card-image').boundingBox();
    expect(Math.abs(img.x - card.x)).toBeLessThanOrEqual(1);
    expect(Math.abs(img.y - card.y)).toBeLessThanOrEqual(1);
    expect(Math.abs(img.width - card.width)).toBeLessThanOrEqual(2);
  });

  test('a quote in a card is plain text, not a box', async ({ page }) => {
    expect(await style(page, '#quote-card > blockquote', 'borderLeftWidth')).toBe('0px');
    expect(await style(page, '#quote-card > blockquote', 'backgroundColor')).toBe('rgba(0, 0, 0, 0)');
  });

  test('a list of images is a centered row; a list with other content is not', async ({ page }) => {
    expect(await style(page, '#logos', 'display')).toBe('flex');
    expect(await style(page, '#logos', 'justifyContent')).toBe('center');
    expect(await style(page, '#mixed-list', 'display')).toBe('block');
  });

  test('the card with the only solid button in a row is featured', async ({ page }) => {
    const primary = await token(page, 'var(--color-primary)');
    expect(await style(page, '#tall-card', 'borderTopColor')).toBe(primary);
    expect(await style(page, '#short-card', 'borderTopColor')).not.toBe(primary);
  });

  test('a section of a figure and a div puts them side by side; a heading and a figure stay stacked', async ({ page }) => {
    const box = (sel) => page.locator(sel).boundingBox();
    const [figure, text] = [await box('#media > figure'), await box('#media-text')];
    expect(text.x).toBeGreaterThan(figure.x + figure.width);
    expect(await style(page, '#chart', 'display')).toBe('block');
    await page.setViewportSize({ width: 390, height: 800 });
    const [f2, t2] = [await box('#media > figure'), await box('#media-text')];
    expect(t2.y).toBeGreaterThan(f2.y + f2.height - 1);
  });

  test('a list of articles is a grid of cards', async ({ page }) => {
    expect(await style(page, '#posts', 'display')).toBe('grid');
    expect(await style(page, '#posts', 'listStyleType')).toBe('none');
    expect(await style(page, '#posts article', 'backgroundColor')).toBe(await token(page, 'var(--color-surface)'));
    const tops = await page.locator('#posts > li').evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().top)));
    expect(new Set(tops).size).toBe(1);
  });
});

test.describe('photo hero', () => {
  for (const scheme of ['light', 'dark']) {
    test(`an image first in the page header fills it behind light text, ${scheme}`, async ({ page }) => {
      await page.setViewportSize({ width: 1100, height: 800 });
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto(fileUrl('tests/fixtures/photo-hero.html'));
      const hero = await page.locator('#hero').boundingBox();
      const photo = await page.locator('#hero-photo').boundingBox();
      // The photo fills the header's padding box (inside its bottom border)
      for (const k of ["x", "y", "width"]) expect(Math.abs(photo[k] - hero[k])).toBeLessThanOrEqual(1);
      expect(Math.abs(photo.height - hero.height)).toBeLessThanOrEqual(1);
      expect(await style(page, '#hero', 'display')).not.toBe('grid');
      expect(await style(page, '#hero hgroup', 'textAlign')).toBe('center');
      // The fixture's photo is pure white, the worst case: blend it over the
      // wash the way the browser does, then check the text against the result.
      // Colors compute as oklch(); a canvas pixel turns them into sRGB.
      const rgb = (sel, prop) => page.locator(sel).evaluate((el, prop) => {
        const ctx = new OffscreenCanvas(1, 1).getContext('2d');
        ctx.fillStyle = getComputedStyle(el)[prop];
        ctx.fillRect(0, 0, 1, 1);
        return [...ctx.getImageData(0, 0, 1, 1).data.slice(0, 3)];
      }, prop);
      const [wr, wg, wb] = await rgb('#hero', 'backgroundColor');
      const opacity = Number(await style(page, '#hero-photo', 'opacity'));
      const bg = [wr, wg, wb].map((v) => v * (1 - opacity) + 255 * opacity);
      const lum = ([r, g, b]) => [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; })
        .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
      for (const sel of ['#title', '#sub', '#eyebrow', '#nav-link']) {
        const fg = await rgb(sel, 'color');
        const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
        expect((a + 0.05) / (b + 0.05), sel).toBeGreaterThanOrEqual(4.5);
      }
    });
  }
});

test.describe('interaction and intent', () => {
  const INTERACTION = fileUrl('tests/fixtures/interaction.html');
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1100, height: 800 });
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'no-preference' });
    await page.goto(INTERACTION);
  });

  test('a dialog fades in, and appears at once with reduced motion', async ({ page }) => {
    expect(await style(page, '#dialog', 'transitionProperty')).toContain('display');
    await page.click('#open-dialog');
    await expect.poll(() => style(page, '#dialog', 'opacity')).toBe('1');
    expect(await style(page, '#dialog', 'transitionDuration')).not.toMatch(/^0s/);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(await style(page, '#dialog', 'transitionDuration')).toMatch(/^0s/);
  });

  test('pages opt in to cross-document view transitions', async ({ page, browserName }) => {
    test.skip(browserName === 'firefox', 'Firefox has no cross-document view transitions');
    // A file:// stylesheet's rules can't be read, so parse the same text inline
    const { readFileSync } = await import('node:fs');
    await page.addStyleTag({ content: readFileSync('tagbrush.css', 'utf8') });
    const found = await page.evaluate(() => {
      const walk = (rules) => [...rules].some((r) => r.constructor.name === 'CSSViewTransitionRule' || (r.cssRules && walk(r.cssRules)));
      return walk([...document.styleSheets].at(-1).cssRules);
    });
    expect(found).toBe(true);
  });

  test('a card whose heading is its only link is clickable all over', async ({ page }) => {
    const box = await page.locator('#linked-card').boundingBox();
    const hit = (x, y) => page.evaluate(([x, y]) => document.elementFromPoint(x, y)?.id, [x, y]);
    expect(await hit(box.x + box.width - 10, box.y + box.height - 10)).toBe('card-link');
    await page.mouse.click(box.x + box.width - 10, box.y + box.height - 10);
    await expect(page).toHaveURL(/#post-1$/);
    // A card with its own button, or without a link, is not one big link
    const other = await page.locator('#action-card').boundingBox();
    expect(await hit(other.x + other.width - 10, other.y + other.height / 2)).not.toBe('card-link');
    expect(await style(page, '#plain-card', 'position')).toBe('static');
  });

  test('a details in the header nav is a dropdown, and a details elsewhere is not', async ({ page }) => {
    await page.click('#services > summary');
    await expect(page.locator('#dropdown-link')).toBeVisible();
    expect(await style(page, '#services > ul', 'position')).toBe('absolute');
    expect(await style(page, '#services > ul', 'flexDirection')).toBe('column');
    expect(await style(page, '#services', 'borderTopWidth')).toBe('0px');
    expect(await style(page, '#plain-details', 'borderTopWidth')).not.toBe('0px');
    // The dropdown keeps its own chevron after the label, not the details marker.
    expect(await style(page, '#services > summary', 'content', '::before')).toBe('none');
    // Inside the phone menu panel the dropdown opens in place
    await page.setViewportSize({ width: 390, height: 800 });
    await page.click('#menu-button');
    expect(await style(page, '#services > ul', 'position')).toBe('static');
  });

  test('a wide table shows a shadow on the side with more to scroll to', async ({ page, browserName }) => {
    test.skip(browserName === 'firefox', 'No scroll-driven animations in Firefox');
    expect(await style(page, '#wide-figure', 'animationName')).toBe('tagbrush-scroll-shadow');
    const shadow = () => style(page, '#wide-figure', 'boxShadow');
    const atStart = await shadow();
    await page.locator('#wide-figure').evaluate((el) => { el.scrollLeft = el.scrollWidth; });
    await expect.poll(shadow).not.toBe(atStart);
    // Something that doesn't scroll has no shadow
    expect(await style(page, '#short-code', 'boxShadow')).toBe('none');
  });

  test('a link in text that opens a new tab gets an arrow; buttons, nav links and document links do not', async ({ page }) => {
    expect(await style(page, '#new-tab', 'content', '::after')).toMatch(/^" ↗"/);
    for (const sel of ['#new-tab-button', '#nav-new-tab', '#plain-link']) expect(await style(page, sel, 'content', '::after'), sel).toBe('none');
    expect(await style(page, '#new-tab-pdf', 'content', '::after')).toMatch(/PDF/);
  });

  test('links to documents say what they are; buttons, nav links and plain links do not', async ({ page }) => {
    const after = (sel) => style(page, sel, 'content', '::after');
    expect(await after('#pdf')).toBe('"PDF"');
    expect(await after('#csv')).toBe('"CSV"');
    expect(await after('#download')).toContain('↓');
    expect(await after('#pdf-button')).toBe('none');
    expect(await after('#nav-pdf')).toBe('none');
    expect(await after('#plain-link')).toBe('none');
  });
});

test.describe('content intent', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 900 });
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto(fileUrl('tests/fixtures/content-intent.html'));
  });

  test('a radio label with a description is a choice card, outlined when chosen', async ({ page }) => {
    expect(await style(page, '#plans', 'display')).toBe('grid');
    expect(await style(page, '#solo', 'backgroundColor')).toBe(await token(page, 'var(--color-surface)'));
    const primary = await token(page, 'var(--color-primary)');
    expect(await style(page, '#team', 'borderTopColor')).toBe(primary);
    expect(await style(page, '#solo', 'borderTopColor')).not.toBe(primary);
    await page.click('#solo');
    expect(await style(page, '#solo', 'borderTopColor')).toBe(primary);
    // Plain radios stay plain
    expect(await style(page, '#plain-radios', 'display')).toBe('block');
    expect(await style(page, '#yes', 'borderTopWidth')).toBe('0px');
  });

  test('a field with a rule turns green once met; a field without one stays neutral', async ({ page }) => {
    const success = await token(page, 'var(--color-success)');
    await page.fill('#email', 'ana@example.org');
    await page.fill('#nickname', 'Ana');
    await page.locator('#nickname').blur();
    // Borders ease into their new color, so wait for it to settle
    await expect.poll(() => style(page, '#email', 'borderTopColor')).toBe(success);
    await page.waitForTimeout(300);
    expect(await style(page, '#nickname', 'borderTopColor')).not.toBe(success);
  });

  test('a quote with a caption in a figure is a pull quote; a plain quote is unchanged', async ({ page }) => {
    expect(await style(page, '#pull > blockquote', 'backgroundColor')).toBe('rgba(0, 0, 0, 0)');
    expect(await style(page, '#pull > blockquote', 'fontSize')).toBe('20px');
    expect(await style(page, '#plain-quote', 'backgroundColor')).toBe(await token(page, 'var(--color-surface)'));
  });

  test('a picture in a caption is a round avatar; a figure\'s own picture is not', async ({ page }) => {
    expect(await style(page, '#avatar', 'width')).toBe('40px');
    expect(await style(page, '#avatar', 'height')).toBe('40px');
    expect(await style(page, '#avatar', 'borderTopLeftRadius')).toBe('50%');
    expect(await style(page, '#chart-image', 'borderTopLeftRadius')).not.toBe('50%');
  });

  test('a <data> value lines up on the right in tabular figures', async ({ page }) => {
    expect(await style(page, '#amount', 'textAlign')).toBe('end');
    expect(await style(page, '#amount', 'fontVariantNumeric')).toBe('tabular-nums');
    expect(await style(page, '#note', 'textAlign')).toBe('start');
  });

  test('an embed without a height is 16:9 at full width; one with a height keeps it', async ({ page }) => {
    const box = await page.locator('#video').boundingBox();
    const main = await page.locator('main').evaluate((el) => el.clientWidth - parseFloat(getComputedStyle(el).paddingLeft) - parseFloat(getComputedStyle(el).paddingRight));
    expect(Math.round(box.width)).toBe(Math.round(main));
    expect(Math.abs(box.height - (box.width * 9) / 16)).toBeLessThan(1);
    expect(await style(page, '#sized', 'height')).toBe('300px');
  });

  test('tabs: a row with an underline under the selected tab', async ({ page }) => {
    expect(await style(page, '#tablist', 'display')).toBe('flex');
    expect(await style(page, '#tab-on', 'borderBottomColor')).toBe(await token(page, 'var(--color-primary)'));
    expect(await style(page, '#tab-off', 'backgroundColor')).toBe('rgba(0, 0, 0, 0)');
    expect(await style(page, '#tab-off', 'color')).toBe(await token(page, 'var(--color-text-muted)'));
    expect(await style(page, '#tab-on', 'color')).toBe(await token(page, 'var(--color-text)'));
  });

  test('a sale price: the old price is muted', async ({ page }) => {
    expect(await style(page, '#was', 'color')).toBe(await token(page, 'var(--color-text-muted)'));
  });

  test('readers who ask for more contrast get darker borders and full-contrast muted text', async ({ page }) => {
    const before = await style(page, '#solo', 'borderTopColor');
    await page.emulateMedia({ contrast: 'more' });
    expect(await style(page, '#solo', 'borderTopColor')).not.toBe(before);
    expect(await style(page, '#solo > small', 'color')).toBe(await token(page, 'var(--color-text)'));
  });

  test('scrollbars follow the theme', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'WebKit does not support scrollbar-color');
    expect(await style(page, 'html', 'scrollbarColor')).not.toBe('auto');
  });

  test('a select opens a themed picker where supported', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'appearance: base-select is Chromium-only for now');
    expect(await style(page, '#country', 'appearance')).toBe('base-select');
    // The arrow is out of the flow, so a site's own display on selects can't wrap it
    expect(await style(page, '#country', 'position', '::picker-icon')).toBe('absolute');
    await page.addStyleTag({ content: 'select { display: inline-block; width: auto; }' });
    expect(await style(page, '#country', 'height')).toBe('42px');
  });
});

test.describe('touch screens', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Touch emulation is checked in Chromium');
  test('header links are at least 44px tall', async ({ browser }) => {
    const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 1100, height: 800 } });
    const page = await context.newPage();
    await page.goto(fileUrl('tests/fixtures/interaction.html'));
    const height = await page.locator('#nav-link').evaluate((el) => el.getBoundingClientRect().height);
    expect(height).toBeGreaterThanOrEqual(44);
    await context.close();
  });
});

test.describe('code highlighting', () => {
  const CODE = fileUrl('tests/fixtures/code.html');
  const KEYWORD = 'rgb(124, 58, 237)';
  const STRING = 'rgb(21, 128, 61)';

  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto(CODE);
  });

  test('Prism, highlight.js, Chroma and Rouge tokens get theme colors', async ({ page }) => {
    const COMMENT = await token(page, 'var(--code-comment)');
    for (const [keyword, string, comment] of [
      ['.token.keyword', '.token.string', '.token.comment'],
      ['.hljs-keyword', '.hljs-string', '.hljs-comment'],
      ['.chroma .kd', '.chroma .s', '.chroma .c1'],
      ['pre.highlight .k', 'pre.highlight .s2', 'pre.highlight .c1'],
    ]) {
      expect(await style(page, keyword, 'color')).toBe(KEYWORD);
      expect(await style(page, string, 'color')).toBe(STRING);
      expect(await style(page, comment, 'color')).toBe(COMMENT);
      expect(await style(page, comment, 'fontStyle')).toBe('italic');
    }
  });

  test('token colors switch in dark mode', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    expect(await style(page, '.token.keyword', 'color')).toBe('rgb(196, 181, 253)');
  });

  test('Shiki dual themes follow the color scheme', async ({ page }) => {
    const token = 'pre.shiki-themes .line > span:first-child';
    expect(await style(page, token, 'color')).toBe('rgb(215, 58, 73)');
    expect(await style(page, 'pre.shiki-themes', 'backgroundColor')).toBe('rgb(255, 255, 255)');
    await page.emulateMedia({ colorScheme: 'dark' });
    expect(await style(page, token, 'color')).toBe('rgb(249, 117, 131)');
    expect(await style(page, 'pre.shiki-themes', 'backgroundColor')).toBe('rgb(36, 41, 46)');
  });

  test('Shiki output under other class names, like Astro\'s, works too', async ({ page }) => {
    const token = 'pre.astro-code .line > span:first-child';
    expect(await style(page, token, 'color')).toBe('rgb(215, 58, 73)');
    expect(await style(page, 'pre.astro-code', 'backgroundColor')).toBe('rgb(255, 255, 255)');
    await page.emulateMedia({ colorScheme: 'dark' });
    expect(await style(page, token, 'color')).toBe('rgb(249, 117, 131)');
  });

  test("Shiki's css-variables theme uses the TagBrush palette", async ({ page }) => {
    expect(await style(page, 'pre.css-variables .line > span:first-child', 'color')).toBe(KEYWORD);
  });

  test('a highlighter theme you load yourself wins', async ({ page }) => {
    await page.addStyleTag({ content: '.token.keyword { color: rgb(1, 2, 3); }' });
    expect(await style(page, '.token.keyword', 'color')).toBe('rgb(1, 2, 3)');
  });
});

test.describe('llms.txt contract', () => {
  // llms.txt, llms/, and the agent files generated from them tell AI agents which HTML
  // TagBrush.css styles. These tests keep those instructions true.
  // The whole guide: the index (llms.txt) and every detail file in llms/.
  const guideText = () => import('node:fs').then(({ readFileSync, readdirSync }) =>
    [readFileSync('llms.txt', 'utf8'), ...readdirSync('llms').filter((f) => f.endsWith('.md')).sort().map((f) => readFileSync(`llms/${f}`, 'utf8'))].join('\n'));

  // Each pattern is a bullet starting with its name in bold: "- **Steps**: …".
  const patternNames = (text) => [...text.matchAll(/^- \*\*([^*]+)\*\*:/gm)].map((m) => m[1]);

  test('every pattern in a detail file has its line in the index, and every index line has details', async () => {
    const { readFileSync, readdirSync } = await import('node:fs');
    const index = patternNames(readFileSync('llms.txt', 'utf8'));
    const detailed = readdirSync('llms').filter((f) => f.endsWith('.md')).flatMap((f) => patternNames(readFileSync(`llms/${f}`, 'utf8')));
    expect(detailed.length).toBeGreaterThan(50);
    expect(detailed.filter((name) => !index.includes(name)), 'patterns an agent reading only llms.txt would never hear of').toEqual([]);
    expect(index.filter((name) => !detailed.includes(name)), 'index lines with no details').toEqual([]);
    expect(new Set(detailed).size, 'pattern names must be unique').toBe(detailed.length);
  });

  test('llms.txt links to every detail file, and llms-full.txt holds them all', async () => {
    const { readFileSync, readdirSync } = await import('node:fs');
    const index = readFileSync('llms.txt', 'utf8');
    const full = readFileSync('llms-full.txt', 'utf8');
    for (const file of readdirSync('llms').filter((f) => f.endsWith('.md'))) {
      expect(index).toContain(`https://kovirlabs.github.io/tagbrush/llms/${file}`);
      for (const name of patternNames(readFileSync(`llms/${file}`, 'utf8'))) expect(full).toContain(`**${name}**:`);
    }
  });
  const css = () => import('node:fs').then(({ readFileSync }) => readFileSync('tagbrush.css', 'utf8'));

  // Inline code that is a real snippet: has a closing tag or attributes, and
  // isn't a page-level tag that can't be dropped into <main>.
  const snippetsIn = (text) => [...text.matchAll(/`(<[a-z][^`]*>)`/g)]
    .map((m) => m[1])
    .filter((html) => html.includes('</') || /^<[a-z]+ /.test(html))
    .filter((html) => !/^<(html|head|body|link|meta)\b/.test(html));

  test('every HTML snippet in llms.txt is styled by TagBrush.css', async ({ browser }) => {
    test.skip(test.info().project.name !== 'chromium', 'Checked once, in Chromium');
    const snippets = snippetsIn(await guideText());
    expect(snippets.length).toBeGreaterThan(15);

    const PROPS = ['display', 'marginBottom', 'paddingLeft', 'paddingTop', 'color', 'backgroundColor', 'borderTopWidth',
      'borderLeftWidth', 'borderTopLeftRadius', 'fontWeight', 'fontSize', 'width', 'listStyleType', 'gap', 'gridTemplateColumns', 'appearance',
      'textDecorationStyle', 'cursor'];
    const signatures = async (url) => {
      const page = await browser.newPage({ viewport: { width: 1000, height: 800 }, colorScheme: 'light' });
      await page.goto(url);
      const result = await page.evaluate(([snippets, props]) => snippets.map((html) => {
        const main = document.querySelector('main') ?? document.body.appendChild(document.createElement('main'));
        main.innerHTML = html;
        const all = [...main.querySelectorAll('*')];
        // Inherited properties only count when the element's own value differs
        // from its parent's, so inheriting the page text color isn't "styled".
        const inherited = new Set(['color', 'fontWeight', 'fontSize', 'listStyleType', 'cursor']);
        return all.map((el) => {
          const cs = getComputedStyle(el);
          const parent = getComputedStyle(el.parentElement);
          return props.map((p) => (inherited.has(p) && cs[p] === parent[p] ? 'inherit' : cs[p])).join('|');
        }).join('\n');
      }), [snippets, PROPS]);
      await page.close();
      return result;
    };
    const styled = await signatures(fileUrl('tests/fixtures/layout.html'));
    const plain = await signatures(fileUrl('tests/fixtures/blank.html'));
    const unstyled = snippets.filter((_, i) => styled[i] === plain[i]);
    expect(unstyled, 'snippets in llms.txt that TagBrush.css does not style').toEqual([]);
  });

  test('every class llms.txt mentions exists in tagbrush.css (or, for class="tagbrush", the scoped build)', async () => {
    const text = await guideText();
    const { readFileSync } = await import('node:fs');
    const source = (await css()) + readFileSync('tagbrush.scoped.css', 'utf8');
    const classes = new Set([
      ...[...text.matchAll(/class="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/)),
      ...[...text.matchAll(/`\.([a-z][a-z-]*)`/g)].map((m) => m[1]),
    ]);
    expect(classes.size).toBeGreaterThan(5);
    const missing = [...classes].filter((name) => !new RegExp(`\\.${name}(?![\\w-])`).test(source));
    expect(missing).toEqual([]);
  });

  test('every role, aria-* and data-* attribute llms.txt mentions is used by tagbrush.css', async () => {
    const text = await guideText();
    const source = await css();
    const attributes = new Set([...text.matchAll(/\b(role="[a-z]+"|aria-[a-z]+|data-[a-z]+)/g)].map((m) => m[1]));
    const missing = [...attributes].filter((attribute) => {
      const name = attribute.split('=')[0];
      const value = attribute.split('=')[1];
      return !source.includes(value ? `${name}=${value}` : name);
    });
    // aria-label and aria-hidden are for assistive tech only and aren't styled.
    expect(missing.filter((a) => a !== 'aria-label' && a !== 'aria-hidden')).toEqual([]);
  });

  test('every CSS variable llms.txt mentions is defined in tagbrush.css', async () => {
    const text = await guideText();
    const source = await css();
    const variables = new Set([...text.matchAll(/(--[a-z][a-z-]*)\s*:/g)].map((m) => m[1]));
    expect(variables.size).toBeGreaterThan(3);
    const missing = [...variables].filter((name) => !source.includes(`${name}:`));
    expect(missing).toEqual([]);
  });
});

test.describe('agent-written pages', () => {
  // Pages written by AI agents that only had llms.txt (see evals/README.md).
  const PAGES = readdirSync('evals/pages').filter((f) => f.endsWith('.html')).sort();
  const ALLOWED_CLASSES = new Set(['button', 'secondary', 'outline', 'container', 'grid', 'card', 'striped', 'visually-hidden']);

  // Serve the CDN stylesheet from this checkout, so the pages test the current CSS.
  const open = async (page, name, { width = 1280, scheme = 'light' } = {}) => {
    await page.route(/cdn\.jsdelivr\.net\/npm\/tagbrush@1\/tagbrush(\.min)?\.css/, (route) =>
      route.fulfill({ path: 'tagbrush.css', contentType: 'text/css' }));
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
    await page.goto(fileUrl(`evals/pages/${name}`));
  };

  test('there are agent-written pages to check', () => {
    expect(PAGES.length).toBeGreaterThanOrEqual(6);
  });

  for (const name of PAGES) {
    test.describe(name, () => {
      test('uses only documented classes and no layout CSS', () => {
        const html = readFileSync(`evals/pages/${name}`, 'utf8');
        const classes = [...html.matchAll(/\sclass="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/).filter(Boolean));
        expect(classes.filter((c) => !ALLOWED_CLASSES.has(c)), 'classes llms.txt does not document').toEqual([]);
        const declarations = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
          .flatMap((m) => [...m[1].replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([a-z-]+)\s*:/g)].map((d) => d[1]));
        expect(declarations.filter((p) => !p.startsWith('--') && p !== 'color-scheme'), 'CSS in <style> other than variables').toEqual([]);
      });

      for (const width of [360, 1280]) {
        test(`no horizontal overflow at ${width}px`, async ({ page }) => {
          await open(page, name, { width });
          const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
          expect(overflow).toBe(0);
        });
      }

      for (const scheme of ['light', 'dark']) {
        test(`all text meets WCAG AA contrast, ${scheme}`, async ({ page }) => {
          await open(page, name, { scheme });
          const failing = await page.evaluate(() => {
            const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
            const rgba = (color) => {
              ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = color; ctx.fillRect(0, 0, 1, 1);
              const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
              return [r, g, b, a / 255];
            };
            const over = (top, bottom) => top.slice(0, 3).map((c, i) => c * top[3] + bottom[i] * (1 - top[3])).concat(1);
            const backdrop = (el) => {
              const layers = [];
              for (let node = el; node; node = node.parentElement) {
                const bg = rgba(getComputedStyle(node).backgroundColor);
                if (bg[3] > 0) layers.push(bg);
                if (bg[3] === 1) break;
              }
              return layers.reduceRight((below, layer) => over(layer, below), [255, 255, 255, 1]);
            };
            const luminance = ([r, g, b]) => {
              const lin = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
              return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
            };
            // Visible elements with their own text. Disabled controls are exempt under WCAG.
            const texts = [...document.body.querySelectorAll('*')].filter((el) =>
              [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) &&
              el.checkVisibility() && !el.closest(':disabled, [aria-disabled="true"], dialog:not([open]), [popover]:not(:popover-open)'));
            return texts.map((el) => {
              const bg = backdrop(el);
              const fg = over(rgba(getComputedStyle(el).color), bg);
              const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
              return { text: `<${el.localName}> ${el.textContent.trim().slice(0, 40)}`, ratio: Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100 };
            }).filter((r) => r.ratio < 4.5);
          });
          expect(failing).toEqual([]);
        });
      }
    });
  }
});

test.describe('app patterns', () => {
  const box = (page, selector) => page.locator(selector).first().evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { left: Math.round(r.left), right: Math.round(r.right), top: Math.round(r.top), bottom: Math.round(r.bottom), width: Math.round(r.width) };
  });

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
  });

  test('<aside> next to <main> becomes a sidebar column', async ({ page }) => {
    await page.goto(fileUrl('tests/fixtures/app.html'));
    expect(await style(page, 'body', 'display')).toBe('grid');
    const aside = await box(page, 'body > aside');
    const main = await box(page, 'body > main');
    const header = await box(page, 'body > header');
    expect(aside.left).toBe(0);
    expect(main.left).toBe(aside.right);
    expect(aside.top).toBe(main.top);
    expect(header.width).toBe(1200);
    expect((await box(page, 'body > footer')).bottom).toBe(800);
    expect(await style(page, 'body > main', 'paddingLeft')).toBe('16px');
  });

  test('the sidebar stacks above main on a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto(fileUrl('tests/fixtures/app.html'));
    const aside = await box(page, 'body > aside');
    const main = await box(page, 'body > main');
    expect(aside.width).toBe(390);
    expect(main.top).toBeGreaterThanOrEqual(aside.bottom);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  });

  test('navigation in an aside is a vertical list with the current page highlighted', async ({ page }) => {
    await page.goto(fileUrl('tests/fixtures/app.html'));
    expect(await style(page, 'aside nav > ul', 'flexDirection')).toBe('column');
    const [first, second] = await page.locator('aside nav > ul > li').evaluateAll((els) => els.slice(0, 2).map((el) => el.getBoundingClientRect().left));
    expect(first).toBe(second);
    expect(await style(page, 'aside [aria-current]', 'backgroundColor')).not.toBe('rgba(0, 0, 0, 0)');
    // The top bar's nav stays a row.
    expect(await style(page, 'body > header nav ul', 'flexDirection')).toBe('row');
  });

  test('a <dl> of <div>s becomes stat tiles; a plain <dl> stays a list', async ({ page }) => {
    await page.goto(fileUrl('tests/fixtures/app.html'));
    expect(await style(page, '#stats', 'display')).toBe('grid');
    const tops = await page.locator('#stats > div').evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().top)));
    expect(new Set(tops).size).toBe(1);
    expect(await style(page, '#stats > div', 'backgroundColor')).toBe(await token(page, 'var(--color-surface)'));
    expect(parseFloat(await style(page, '#stats dd', 'fontSize'))).toBeGreaterThan(20);
    expect(await style(page, '#plain', 'display')).toBe('block');
  });

  test('a change in a stat tile is colored text with an arrow; ins and del elsewhere stay edit marks', async ({ page }) => {
    await page.goto(fileUrl('tests/fixtures/app.html'));
    for (const [tag, arrow] of [['ins', '▲'], ['del', '▼']]) {
      const sel = `#stats ${tag}`;
      expect(await style(page, sel, 'backgroundColor')).toBe('rgba(0, 0, 0, 0)');
      expect(await style(page, sel, 'textDecorationLine')).toBe('none');
      expect(await style(page, sel, 'content', '::before')).toContain(arrow);
      expect(await style(page, sel, 'color')).not.toBe(await token(page, 'var(--color-text)'));
    }
    expect(await style(page, '#edits del', 'textDecorationLine')).toBe('line-through');
    expect(await style(page, '#edits del', 'backgroundColor')).not.toBe('rgba(0, 0, 0, 0)');
    expect(await style(page, '#edits ins', 'backgroundColor')).not.toBe('rgba(0, 0, 0, 0)');
    expect(await style(page, '#edits ins', 'content', '::before')).toBe('none');
  });

  test('a header with a title and a button puts them on one row', async ({ page }) => {
    await page.goto(fileUrl('tests/fixtures/app.html'));
    const title = await box(page, 'main > header > h1');
    const button = await box(page, 'main > header > button');
    expect(button.top).toBeLessThan(title.bottom);
    expect(button.right).toBe((await box(page, 'main > header')).right);
  });

  test('<search> lays out its fields in a row', async ({ page }) => {
    await page.goto(fileUrl('tests/fixtures/app.html'));
    const tops = await page.locator('search > *').evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().top)));
    expect(new Set(tops).size).toBe(1);
  });

  test('an aside next to an article in main is a sticky table of contents', async ({ page }) => {
    await page.goto(fileUrl('tests/fixtures/docs-sidebar.html'));
    expect(await style(page, 'main', 'display')).toBe('grid');
    expect(await style(page, 'main > aside', 'position')).toBe('sticky');
    const aside = await box(page, 'main > aside');
    const article = await box(page, 'main > article');
    expect(article.left).toBeGreaterThan(aside.right);
    expect(article.left - aside.right).toBeLessThanOrEqual(40);
    expect(aside.top).toBe(article.top);
  });

  test('an aside whose content is hidden takes no column, so the article has the width', async ({ page }) => {
    await page.goto(fileUrl('tests/fixtures/docs-sidebar.html'));
    await page.evaluate(() => { document.querySelector('main > aside > nav').hidden = true; });
    expect(await style(page, 'main', 'display')).not.toBe('grid');
    // The article is centered at reading width, as on a page with no aside
    const main = await box(page, 'main');
    const article = await box(page, 'main > article');
    expect(Math.abs((article.left + article.right) / 2 - (main.left + main.right) / 2)).toBeLessThanOrEqual(1);
    await page.evaluate(() => { document.querySelector('main > aside > nav').hidden = false; });
    expect(await style(page, 'main', 'display')).toBe('grid');
  });

  test('an hgroup in the page header is a centered hero', async ({ page }) => {
    await page.goto(fileUrl('tests/fixtures/hero.html'));
    expect(await style(page, 'header > hgroup', 'textAlign')).toBe('center');
    expect(parseFloat(await style(page, 'header > hgroup > h1', 'fontSize'))).toBeGreaterThan(40);
    expect(await style(page, 'header > [role=group]', 'justifyContent')).toBe('center');
  });

  test('a header inside main is not a hero, even with an hgroup', async ({ page }) => {
    await page.goto(fileUrl('tests/fixtures/layout.html'));
    await page.evaluate(() => { document.body.innerHTML = '<header><nav><strong>Site</strong></nav></header><main><header><hgroup><h1>Dashboard</h1><p>Last 30 days</p></hgroup><button>Export</button></header></main>'; });
    expect(await style(page, 'main hgroup', 'textAlign')).not.toBe('center');
    expect(parseFloat(await style(page, 'main h1', 'fontSize'))).toBeLessThanOrEqual(40);
  });

  test('a menu in a popover is a vertical list', async ({ page }) => {
    await page.goto(fileUrl('tests/fixtures/layout.html'));
    await page.evaluate(() => { document.body.innerHTML = '<header><nav><strong>Site</strong><ul><li><button popovertarget="m">Me</button></li></ul></nav></header><div popover id="m"><nav aria-label="Account"><ul><li><a href="#">Profile</a></li><li><a href="#">Sign out</a></li></ul></nav></div>'; });
    await page.click('[popovertarget=m]');
    const lefts = await page.locator('#m li').evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().left)));
    expect(new Set(lefts).size).toBe(1);
    expect(await style(page, 'header nav ul', 'flexDirection')).toBe('row');
  });

  test('the scoped and Shadow DOM builds leave the page-level sidebar and hero out', async () => {
    for (const file of ['tagbrush.scoped.css', 'tagbrush.shadow.css']) {
      const text = readFileSync(file, 'utf8');
      expect(text).not.toContain('grid-template-areas: "header header"');
      expect(text).not.toContain('header > hgroup');
    }
  });
});

test.describe('polish: badges, icons, hero, sidebar, footer', () => {
  const rect = (page, selector) => page.locator(selector).first().evaluate((el) => el.getBoundingClientRect().toJSON());

  test('a label before the heading in an hgroup leaves the heading unmuted', async ({ page }) => {
    await page.goto(fileUrl('tests/fixtures/polish.html'));
    expect(await style(page, '#label-heading', 'color')).toBe(await token(page, 'var(--color-heading)'));
    expect(await style(page, '#label', 'textTransform')).toBe('uppercase');
    expect(await style(page, '#section-head > p:last-child', 'color')).toBe(await token(page, 'var(--color-text-muted)'));
    expect(await style(page, '#hero-title', 'color')).toBe(await token(page, 'var(--color-heading)'));
  });

  test('a mark with a tone is a tinted badge; a plain mark stays a highlight', async ({ page }) => {
    await page.goto(fileUrl('tests/fixtures/polish.html'));
    const success = await style(page, '#badge-success', 'backgroundColor');
    expect(success).not.toBe(await style(page, '#plain-mark', 'backgroundColor'));
    expect(success).not.toBe(await style(page, 'mark[data-tone=error]', 'backgroundColor'));
    expect(parseFloat(await style(page, '#badge-success', 'borderTopLeftRadius'))).toBeGreaterThan(5);
    expect(await style(page, '#plain-mark', 'backgroundColor')).toBe(await token(page, 'var(--color-highlight)'));
    expect(await style(page, 'mark[style]', 'backgroundColor')).not.toBe(success);
    expect(await style(page, '#callout', 'borderLeftColor')).toBe(await token(page, 'var(--color-warning)'));
  });

  test('icons are sized to the text; a feature card icon sits on a tile', async ({ page }) => {
    await page.goto(fileUrl('tests/fixtures/polish.html'));
    expect((await rect(page, '#icon-button svg')).width).toBe(20);
    expect(await style(page, '#icon-only', 'display')).toBe('inline-flex');
    expect((await rect(page, '#nav-icon svg')).width).toBe(20);
    expect((await rect(page, '#icon-only svg')).width).toBe(20);
    const tile = await rect(page, '#features > article > svg');
    expect(tile.width).toBe(44);
    expect(await style(page, '#features > article > svg', 'backgroundColor')).not.toBe('rgba(0, 0, 0, 0)');
    // An illustration with a width attribute, and a chart outside these places, keep their size.
    expect((await rect(page, '#hero-figure svg')).width).toBeGreaterThan(200);
  });

  test('a hero with a figure puts it beside the text, and below it on phones', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(fileUrl('tests/fixtures/polish.html'));
    const [hero, figure] = [await rect(page, '#hero'), await rect(page, '#hero-figure')];
    expect(figure.left).toBeGreaterThan(hero.right);
    expect((await rect(page, '#hero-note')).right).toBeLessThan(figure.left);
    expect(await style(page, '#hero', 'textAlign')).toBe('start');
    expect(await style(page, 'body > header', 'backgroundImage')).toContain('radial-gradient');
    await page.setViewportSize({ width: 390, height: 900 });
    const [heroPhone, figurePhone] = [await rect(page, '#hero'), await rect(page, '#hero-figure')];
    expect(figurePhone.top).toBeGreaterThan(heroPhone.bottom);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });

  test('the hero subtitle stays readable on the hero background', async ({ page }) => {
    for (const scheme of ['light', 'dark']) {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto(fileUrl('tests/fixtures/polish.html'));
      const ratio = await page.evaluate(() => {
        const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
        const rgb = (color) => { ctx.fillStyle = color; ctx.fillRect(0, 0, 1, 1); return [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3); };
        const probe = document.createElement('i');
        // The strongest point of the wash: 9% primary over the page background.
        probe.style.color = 'color-mix(in oklab, var(--color-primary) 9%, var(--color-background))';
        document.body.append(probe);
        const bg = rgb(getComputedStyle(probe).color);
        const fg = rgb(getComputedStyle(document.querySelector('#hero-sub')).color);
        const lum = ([r, g, b]) => [r, g, b].map((c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)).reduce((s, c, i) => s + c * [0.2126, 0.7152, 0.0722][i], 0);
        const [hi, lo] = [lum(fg), lum(bg)].sort((a, b) => b - a);
        return (hi + 0.05) / (lo + 0.05);
      });
      expect(ratio, scheme).toBeGreaterThanOrEqual(4.5);
    }
  });

  test('an aside before the header runs the full height, with the header beside it', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(fileUrl('tests/fixtures/app-full.html'));
    const [aside, header, main] = [await rect(page, 'body > aside'), await rect(page, 'body > header'), await rect(page, 'body > main')];
    expect(aside.top).toBe(0);
    expect(aside.height).toBe(900);
    expect(header.left).toBeGreaterThanOrEqual(aside.right - 1);
    expect(main.left).toBeGreaterThanOrEqual(aside.right - 1);
    await page.setViewportSize({ width: 390, height: 900 });
    const [asidePhone, headerPhone] = [await rect(page, 'body > aside'), await rect(page, 'body > header')];
    expect(headerPhone.bottom).toBeLessThanOrEqual(asidePhone.top + 1);
  });

  test('a footer with several navs lays them out as columns', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(fileUrl('tests/fixtures/polish.html'));
    const tops = await page.locator('body > footer > nav').evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().top)));
    expect(new Set(tops).size).toBe(1);
    expect(await style(page, 'body > footer > nav ul', 'flexDirection')).toBe('column');
    const copyright = await rect(page, '#copyright');
    expect(copyright.top).toBeGreaterThan(tops[0]);
    // The leading paragraph takes the free space; the columns sit at the end of the row.
    const navs = await page.locator('body > footer > nav').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().toJSON()));
    const lead = await rect(page, 'body > footer > p:first-child');
    expect(lead.right).toBeLessThan(navs[0].left);
    expect(Math.round(navs.at(-1).right)).toBeGreaterThanOrEqual(Math.round(copyright.right) - 2);
    // On a phone the columns wrap and nothing overflows.
    await page.setViewportSize({ width: 360, height: 800 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  });
});

test.describe('print', () => {
  test('controls are left out of a printout; header sort text, links styled as buttons, and closed details content print', async ({ page }) => {
    await page.goto(fileUrl('tests/fixtures/print.html'));
    await page.emulateMedia({ media: 'print' });
    for (const sel of ['body > header nav', 'search', '#action']) expect(await style(page, sel, 'display'), sel).toBe('none');
    expect(await style(page, '#sort', 'display')).not.toBe('none');
    expect(await style(page, '#link-button', 'display')).not.toBe('none');
    expect(await style(page, '#card', 'breakInside')).toBe('avoid');
    if (await page.evaluate(() => CSS.supports('selector(::details-content)'))) {
      expect((await page.locator('#answer').boundingBox())?.height ?? 0).toBeGreaterThan(0);
    }
    await page.emulateMedia({ media: 'screen' });
    expect(await style(page, '#action', 'display')).not.toBe('none'); // only in print
  });
});

test.describe('menus stay on screen', () => {
  test('a menu popover opens under its button, flips at the edges, and a plain popover stays centered', async ({ page, browserName }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 800, height: 600 });
    await page.goto(fileUrl('tests/fixtures/menus.html'));
    test.skip(!(await page.evaluate(() => CSS.supports('position-area: block-end'))), `${browserName}: no anchor positioning, popovers stay centered`);
    const box = (sel) => page.locator(sel).boundingBox();
    await page.click('#left-button');
    let [button, menu] = [await box('#left-button'), await box('#left-menu')];
    expect(menu.y).toBeGreaterThanOrEqual(button.y + button.height);
    expect(menu.x).toBeGreaterThanOrEqual(0);
    expect(menu.x).toBeLessThan(button.x + button.width); // beside the button, not centered
    await page.keyboard.press('Escape');
    await page.click('#right-button');
    [button, menu] = [await box('#right-button'), await box('#right-menu')];
    expect(menu.x + menu.width).toBeLessThanOrEqual(800);
    expect(menu.x + menu.width).toBeGreaterThan(button.x); // aligned to the button's edge
    await page.keyboard.press('Escape');
    // Near the bottom edge it flips up.
    await page.setViewportSize({ width: 800, height: 260 });
    await page.locator('#right-button').evaluate((el) => el.scrollIntoView({ block: 'end' }));
    await page.click('#right-button');
    [button, menu] = [await box('#right-button'), await box('#right-menu')];
    expect(menu.y + menu.height).toBeLessThanOrEqual(button.y + 1);
    await page.keyboard.press('Escape');
    await page.setViewportSize({ width: 800, height: 600 });
    await page.click('#tip-button');
    const tip = await box('#tip');
    expect(Math.abs(tip.x + tip.width / 2 - 400)).toBeLessThan(2);
  });
});

test.describe('tooltips', () => {
  test('a popover="hint" is a small inverted tooltip above its trigger; a plain popover keeps its look', async ({ page, browserName }) => {
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: 'light' });
    await page.goto(fileUrl('tests/fixtures/menus.html'));
    expect(await style(page, '#save-tip', 'backgroundColor')).toBe(await token(page, 'var(--color-text)'));
    expect(await style(page, '#save-tip', 'color')).toBe(await token(page, 'var(--color-background)'));
    expect(await style(page, '#save-tip', 'fontSize')).toBe('14px');
    expect(await style(page, '#tip', 'backgroundColor')).toBe(await token(page, 'var(--color-background)')); // false match
    test.skip(!(await page.evaluate(() => 'interestForElement' in HTMLButtonElement.prototype)), `${browserName}: no interestfor; the tooltip doesn't open (no JS fallback, by design)`);
    await page.hover('#save');
    await expect(page.locator('#save-tip')).toBeVisible();
    const [button, tip] = [await page.locator('#save').boundingBox(), await page.locator('#save-tip').boundingBox()];
    expect(tip.y + tip.height).toBeLessThanOrEqual(button.y);
  });
});

test.describe('sticky header', () => {
  test('header[data-layout="sticky"] stays at the top and a jumped-to heading lands below it', async ({ page, browserName }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1000, height: 700 });
    await page.goto(fileUrl('tests/fixtures/sticky.html'));
    expect(await style(page, 'body > header', 'position')).toBe('sticky');
    expect(await style(page, 'html', 'scrollPaddingTop')).toBe('80px');
    expect(await style(page, 'body > header', 'content', '::after')).not.toBe('none');
    const shadow = () => style(page, 'body > header', 'opacity', '::after');
    expect(await shadow()).toBe('0');
    await page.click('a[href="#pricing"]');
    await page.waitForTimeout(100);
    const header = await page.locator('body > header').boundingBox();
    const heading = await page.locator('#pricing-heading').boundingBox();
    expect(header.y).toBe(0);
    expect(heading.y).toBeGreaterThanOrEqual(header.height);
    const supported = await page.evaluate(() => CSS.supports('container-type: scroll-state'));
    if (supported) await expect.poll(shadow).toBe('1'); // stuck: a soft shadow
    else expect(await shadow(), `${browserName}: no scroll-state queries, hairline only`).toBe('0');
  });

  test('a field focused right under the sticky bar (an invalid field on submit) scrolls out from under it', async ({ page, browserName }) => {
    // Measured: WebKit's focus() scroll stops about 5px short of scroll-padding-top,
    // so TagAction scrolls the first invalid field to the middle itself.
    test.skip(browserName === 'webkit', 'WebKit focus() scrolling stops short of scroll-padding-top');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1000, height: 700 });
    await page.goto(fileUrl('tests/fixtures/sticky.html'));
    // Put the field just under the top edge, behind the bar, then focus it the way form validation does.
    await page.evaluate(() => scrollTo(0, document.querySelector('#email').getBoundingClientRect().top + scrollY - 10));
    await page.locator('#email').evaluate((el) => el.focus());
    const [header, field] = [await page.locator('body > header').boundingBox(), await page.locator('#email').boundingBox()];
    expect(field.y).toBeGreaterThanOrEqual(header.y + header.height);
  });

  test('a header without the attribute, or a header in main, does not stick', async ({ page }) => {
    await page.goto(fileUrl('tests/fixtures/landing.html'));
    expect(await style(page, 'body > header', 'position')).toBe('static');
    expect(await style(page, 'html', 'scrollPaddingTop')).toBe('auto');
  });
});

test.describe('states people expect', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await page.goto(fileUrl('tests/fixtures/states.html'));
  });

  test('a button with aria-expanded shows a chevron that flips when open; other buttons have none', async ({ page }) => {
    const rotate = (sel) => style(page, sel, 'rotate', '::after');
    expect(await style(page, '#expand-closed', 'borderRightStyle', '::after')).toBe('solid');
    expect(await rotate('#expand-closed')).toBe('45deg');
    expect(await rotate('#expand-open')).toBe('-135deg');
    await page.locator('#expand-closed').evaluate((el) => el.setAttribute('aria-expanded', 'true'));
    expect(await rotate('#expand-closed')).toBe('-135deg');
    for (const sel of ['#plain-button', '#link-button']) expect(await style(page, sel, 'content', '::after')).toBe('none');
  });

  test('a button with data-tone is filled with the tone; an outline one is bordered in it', async ({ page }) => {
    const red = await token(page, 'oklch(from var(--color-error) min(l, 0.5) c h)');
    expect(await style(page, '#danger', 'backgroundColor')).toBe(red);
    expect(await style(page, '#danger', 'color')).toBe('rgb(255, 255, 255)');
    expect(await style(page, '#danger-outline', 'backgroundColor')).toBe('rgba(0, 0, 0, 0)');
    expect(await style(page, '#danger-outline', 'borderTopColor')).toBe(await token(page, 'var(--color-error)'));
    expect(await style(page, '#tone-link', 'backgroundColor')).not.toBe(await style(page, '#plain-button', 'backgroundColor'));
    expect(await style(page, '#custom-tone', 'backgroundColor')).not.toBe(await style(page, '#plain-button', 'backgroundColor'));
    // A badge with a tone is still a badge, not a button.
    expect(await style(page, '#plain-button', 'backgroundColor')).toBe(await token(page, 'var(--color-primary)'));
  });

  test('required fields get a red asterisk, only in a form that also has optional fields', async ({ page }) => {
    const after = (sel) => style(page, sel, 'content', '::after');
    expect(await after('#label-name')).toMatch(/^" \*"/);
    expect(await after('#label-terms')).toMatch(/^" \*"/);
    expect(await after('#label-password')).toMatch(/^" \*"/); // a field in a row with its button (TagAction's Show/Hide)
    expect(await style(page, '#label-name', 'color', '::after')).toBe(await token(page, 'var(--color-error)'));
    expect(await after('#label-company')).toBe('none');
    expect(await after('#label-news')).toBe('none');
    // A sign-in form where every field is required (buttons and hidden fields don't count) has no marks.
    expect(await after('#label-email')).toBe('none');
  });

  test('role="status" and role="alert" blocks are tinted banners; empty, inline and TagAction regions are not', async ({ page }) => {
    const bg = (sel) => style(page, sel, 'backgroundColor');
    const [saved, failed, toned] = [await bg('#saved'), await bg('#failed'), await bg('#toned')];
    expect(new Set([saved, failed, toned]).size).toBe(3);
    expect(saved).not.toBe('rgba(0, 0, 0, 0)');
    expect(failed).toBe(await token(page, 'color-mix(in oklab, var(--color-error) 14%, var(--color-background))'));
    expect(await style(page, '#saved', 'paddingLeft')).not.toBe('0px');
    for (const sel of ['#empty-region', '#inline-status', '#tagaction-status']) {
      expect(await bg(sel), sel).toBe('rgba(0, 0, 0, 0)');
      expect(await style(page, sel, 'paddingLeft'), sel).toBe('0px');
    }
  });

  test('a row with a checked checkbox in its first cell is tinted; a switch or a later checkbox is not', async ({ page }) => {
    const none = 'rgba(0, 0, 0, 0)';
    expect(await style(page, '#row-on', 'backgroundColor')).not.toBe(none);
    expect(await style(page, '#row-off', 'backgroundColor')).toBe(none); // its switch is on, but it isn't selected
    expect(await style(page, '#row-done', 'backgroundColor')).toBe(none); // a checkbox in a later cell is data
  });

  test('a toggle with aria-pressed="true" looks held down; "false" looks like any button', async ({ page }) => {
    expect(await style(page, '#pressed-on', 'boxShadow')).toContain('inset');
    expect(await style(page, '#pressed-on', 'backgroundColor')).not.toBe(await style(page, '#pressed-off', 'backgroundColor'));
    expect(await style(page, '#pressed-off', 'backgroundColor')).toBe(await style(page, '#plain-button', 'backgroundColor'));
    expect(await style(page, '#pressed-off', 'boxShadow')).toBe('none');
    expect(await style(page, '#outline-on', 'backgroundColor')).not.toBe('rgba(0, 0, 0, 0)');
    expect(await style(page, '#outline-off', 'backgroundColor')).toBe('rgba(0, 0, 0, 0)');
  });
});

test.describe('chat and AI output', () => {
  // A chat message styled by the scoped build, with data-density="compact".
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto(fileUrl('tests/fixtures/chat.html'));
  });

  test('compact density tightens spacing and headings, only where it is set', async ({ page }) => {
    const px = async (selector, prop) => parseFloat(await style(page, selector, prop));
    expect(await px('#h1', 'fontSize')).toBe(24);
    expect(await px('#normal-h1', 'fontSize')).toBeGreaterThan(24);
    expect(await px('#message > p', 'marginBottom')).toBe(12);
    expect(await px('#normal p', 'marginBottom')).toBe(16); // a normal message keeps the usual spacing, even on its last element
    expect(await px('#table th', 'paddingTop')).toBe(6);
  });

  test('the last element of a compact message adds no space below it', async ({ page }) => {
    expect(await style(page, '#sources', 'marginBottom')).toBe('0px');
  });

  test('a reasoning block is muted, smaller, and marked by a left rule', async ({ page }) => {
    for (const selector of ['#reasoning', '#owui']) {
      expect(await style(page, selector, 'borderLeftWidth')).toBe('2px');
      expect(await style(page, selector, 'borderTopWidth')).toBe('0px');
      expect(await style(page, selector, 'color')).toBe(await token(page, 'var(--color-text-muted)', '#message'));
    }
  });

  test('a citation is a chip, and Pandoc task lists lose their bullets', async ({ page }) => {
    expect(await style(page, '#cite', 'borderTopLeftRadius')).not.toBe('0px');
    expect(await style(page, '#cite', 'backgroundColor')).toBe(await token(page, 'var(--color-surface)', '#message'));
    expect(await style(page, '#cite', 'textDecorationLine')).toBe('none');
    expect(await style(page, '.task-list li', 'listStyleType')).toBe('none');
  });

  test('GitHub alerts and admonitions are callouts colored by kind', async ({ page }) => {
    expect(await style(page, '#alert', 'borderLeftColor')).toBe(await token(page, 'var(--color-warning)', '#message'));
    expect(await style(page, '#admonition', 'borderLeftColor')).toBe(await token(page, 'var(--color-success)', '#message'));
    expect(await style(page, '#alert > p:first-child', 'fontWeight')).toBe('600');
    expect(await style(page, '#alert > p:first-child', 'marginBottom')).toBe('3px');
  });

  test('nothing widens a phone-width column: long code wraps, tables and math scroll', async ({ page }) => {
    expect(await page.locator('#long-code').evaluate((el) => el.getClientRects().length)).toBeGreaterThan(1); // wrapped onto more lines
    expect(await style(page, '#table', 'overflowX')).toBe('auto');
    expect(await style(page, '#math', 'overflowX')).toBe('auto');
    // KaTeX and MathJax wrap block math in an element that scrolls in every browser.
    // (Firefox and Safari don't scroll a bare <math> element, so the fixture's MathML is short.)
    expect(await style(page, '#katex', 'overflowX')).toBe('auto');
    expect(await page.locator('#katex').evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  });

  test('a code block that has only just opened already has a line of height', async ({ page }) => {
    const height = await page.locator('#empty-pre').evaluate((el) => el.getBoundingClientRect().height);
    expect(height).toBeGreaterThan(30);
  });

  for (const scheme of ['light', 'dark']) {
    test(`chat text meets WCAG AA contrast, ${scheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.locator('#reasoning summary').click();
      const failing = await page.evaluate(() => {
        const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
        const rgba = (color) => { ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = color; ctx.fillRect(0, 0, 1, 1); const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data; return [r, g, b, a / 255]; };
        const over = (top, bottom) => top.slice(0, 3).map((c, i) => c * top[3] + bottom[i] * (1 - top[3])).concat(1);
        const backdrop = (el) => { const layers = []; for (let n = el; n; n = n.parentElement) { const bg = rgba(getComputedStyle(n).backgroundColor); if (bg[3] > 0) layers.push(bg); if (bg[3] === 1) break; } return layers.reduceRight((below, layer) => over(layer, below), [255, 255, 255, 1]); };
        const lum = ([r, g, b]) => { const f = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4); return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
        return [...document.querySelectorAll('#message *')]
          .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && el.checkVisibility() && !el.closest('math, :disabled'))
          .map((el) => { const bg = backdrop(el); const fg = over(rgba(getComputedStyle(el).color), bg); const [hi, lo] = [lum(fg), lum(bg)].sort((a, b) => b - a); return { el: el.localName + (el.id ? `#${el.id}` : ''), ratio: Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100 }; })
          .filter((r) => r.ratio < 4.5);
      });
      expect(failing).toEqual([]);
    });
  }
});

test.describe('debug mode', () => {
  const outline = (page, selector) => style(page, selector, 'outlineStyle');

  test.beforeEach(async ({ page }) => {
    await page.goto(fileUrl('tests/fixtures/debug.html'));
  });

  test('outlines mistakes in red', async ({ page }) => {
    for (const selector of ['#no-alt', '[data-test=unlabeled-input]', '#empty-button', '#empty-link', '#click-div']) {
      expect(await outline(page, selector), selector).toBe('dashed');
    }
  });

  test('outlines unused classes and inline layout styles in amber', async ({ page }) => {
    expect(await outline(page, '#invented-class')).toBe('dotted');
    expect(await outline(page, '#inline-layout')).toBe('dotted');
  });

  test('leaves correct HTML alone', async ({ page }) => {
    for (const selector of ['#has-alt', '#named', '#wrapped', '#aria-named', '#text-button', '#icon-button', '#button-link', '#variable-style', '#token']) {
      expect(await outline(page, selector), selector).toBe('none');
    }
  });

  test('shows a legend, and does nothing without the attribute', async ({ page }) => {
    expect(await style(page, 'body', 'content', '::after')).toContain('TagBrush debug');
    await page.evaluate(() => document.documentElement.removeAttribute('data-tagbrush'));
    expect(await outline(page, '#no-alt')).toBe('none');
    expect(await style(page, 'body', 'content', '::after')).toBe('none');
  });
});

test.describe('npx tagbrush check', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Runs in Node, once');
  const run = (...args) => spawnSync(process.execPath, ['bin/tagbrush.mjs', ...args], { encoding: 'utf8' });
  const rules = (html) => check(html).map((p) => `${p.level}:${p.rule}`);
  const page = (body, head = '<meta name="viewport" content="width=device-width"><link rel="stylesheet" href="tagbrush.css">') =>
    `<!DOCTYPE html><html lang="en"><head>${head}</head><body>${body}</body></html>`;

  test('reports every problem in the debug fixture and exits with 1', () => {
    const result = run('check', 'tests/fixtures/debug.html');
    expect(result.status).toBe(1);
    for (const rule of ['missing-alt', 'unlabeled-field', 'empty-button', 'empty-link', 'clickable-div', 'unknown-class', 'inline-style']) {
      expect(result.stdout).toContain(rule);
    }
    expect(result.stdout).toMatch(/1 file checked: 5 errors, 3 warnings/);
  });

  test('pages written by agents and starter.html are clean', () => {
    const result = run('check', 'evals/pages', 'starter.html');
    expect(result.stdout).toMatch(/0 errors, 0 warnings/);
    expect(result.status).toBe(0);
  });

  test('labels: for/id pairs, wrapping, and aria-label all count; a missing target does not', () => {
    expect(rules(page('<label for="a">A</label><input id="a">'))).toEqual([]);
    expect(rules(page('<label>B <input></label>'))).toEqual([]);
    expect(rules(page('<input aria-label="Search" type="search">'))).toEqual([]);
    expect(rules(page('<input type="hidden" name="token"><input type="submit" value="Go">'))).toEqual([]);
    expect(rules(page('<label for="missing">C</label><input id="other">'))).toEqual(['error:label-for-missing', 'error:unlabeled-field']);
  });

  test('buttons and links are named by text, aria-label, or an image with alt text', () => {
    expect(rules(page('<button><img src="x.svg" alt="Close"></button><a href="/"><span>Home</span></a>'))).toEqual([]);
    expect(rules(page('<button><img src="x.svg" alt=""></button>'))).toEqual(['error:empty-button']);
  });

  test('page basics, headings, ids, and styles', () => {
    expect(rules('<html><body><h1>A</h1></body></html>')).toEqual(['error:missing-lang', 'warning:missing-viewport', 'warning:missing-stylesheet']);
    expect(rules(page('<h1>A</h1><h3>B</h3>'))).toEqual(['warning:heading-skip']);
    expect(rules(page('<p id="x"></p><p id="x"></p>'))).toEqual(['warning:duplicate-id']);
    expect(rules(page('<main></main><main></main>'))).toEqual(['error:multiple-main']);
    expect(rules(page('', '<meta name="viewport" content="x"><link rel="stylesheet" href="tagbrush.css"><style>:root { --color-primary: #0f766e; color-scheme: light; }</style>'))).toEqual([]);
    expect(rules(page('', '<meta name="viewport" content="x"><link rel="stylesheet" href="tagbrush.css"><style>.hero { display: grid; }</style>'))).toEqual(['warning:style-block']);
  });

  test('classes inside code blocks and documented classes are fine', () => {
    expect(rules(page('<pre><code class="language-js"><span class="token keyword">const</span></code></pre><a class="button outline" href="/">Go</a>'))).toEqual([]);
  });

  test('--json prints structured results and --strict fails on warnings', () => {
    const json = JSON.parse(run('check', 'tests/fixtures/debug.html', '--json').stdout);
    expect(json[0].problems.some((p) => p.rule === 'missing-alt' && p.line === 12)).toBe(true);
    expect(run('check', 'evals/pages/landing.html', '--strict').status).toBe(0);
    expect(run('help').status).toBe(2);
  });
});

test.describe('accessibility', () => {
  // WCAG AA asks for 4.5:1 between normal-size text and its background.
  const AA = 4.5;

  // The default, the theme builder presets, and some extremes. Button text,
  // links and outline buttons derive from --color-primary, so all must pass.
  const PRIMARIES = [null, '#10b981', '#8b5cf6', '#f43f5e', '#f59e0b', '#1e3a8a', '#facc15', '#ff0000', '#000000', '#ffffff'];

  for (const scheme of ['light', 'dark']) {
    for (const primary of PRIMARIES) {
    test(`text colors meet WCAG AA contrast, ${scheme}, primary ${primary ?? 'default'}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
      await page.goto(fileUrl('tests/fixtures/contrast.html'));
      if (primary) await page.evaluate((value) => document.documentElement.style.setProperty('--color-primary', value), primary);
      const results = await page.evaluate(() => {
        // Let the browser convert any computed color (rgb, color(srgb …), …) to RGBA bytes.
        const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
        const rgba = (color) => {
          ctx.clearRect(0, 0, 1, 1);
          ctx.fillStyle = color;
          ctx.fillRect(0, 0, 1, 1);
          const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
          return [r, g, b, a / 255];
        };
        const over = (top, bottom) => top.slice(0, 3).map((c, i) => c * top[3] + bottom[i] * (1 - top[3])).concat(1);
        // Composite every translucent background from the element up to the first opaque one.
        const backdrop = (el) => {
          const layers = [];
          for (let node = el; node; node = node.parentElement) {
            const bg = rgba(getComputedStyle(node).backgroundColor);
            if (bg[3] > 0) layers.push(bg);
            if (bg[3] === 1) break;
          }
          return layers.reduceRight((below, layer) => over(layer, below), [255, 255, 255, 1]);
        };
        const luminance = ([r, g, b]) => {
          const lin = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
          return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
        };
        return [...document.querySelectorAll('[data-check]')].map((el) => {
          const bg = backdrop(el);
          const fg = over(rgba(getComputedStyle(el).color), bg);
          const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
          const label = `<${el.localName}${el.className ? `.${el.className}` : ''}> "${el.textContent.trim() || el.value}"`;
          return { label, ratio: Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100 };
        });
      });
      expect(results.length).toBeGreaterThan(30);
      const failing = results.filter((r) => r.ratio < AA);
      expect(failing, `below ${AA}:1 in ${scheme} mode with primary ${primary ?? 'default'}`).toEqual([]);
    });
    }
  }
});

test.describe('size budget', () => {
  // Coverage matters more than bytes (see ROADMAP.md); this ceiling only
  // catches accidental bloat. The index (llms.txt) is read on every page an
  // agent builds, so it stays small; the detail files are read when a task
  // needs them and only have a bloat check.
  const BUDGET = 15 * 1024;
  const GUIDE_TOKENS = 4000;
  const FULL_GUIDE_TOKENS = 20000;

  test.skip(({ browserName }) => browserName !== 'chromium', 'File size is the same in every browser');

  test(`tagbrush.min.css is at most ${BUDGET / 1024} KB gzipped`, async () => {
    const { gzipSync } = await import('node:zlib');
    const { readFileSync } = await import('node:fs');
    const size = gzipSync(readFileSync('tagbrush.min.css'), { level: 9 }).length;
    expect(size).toBeLessThanOrEqual(BUDGET);
  });

  test(`llms.txt is at most ${GUIDE_TOKENS} tokens`, async () => {
    const { encode } = await import('gpt-tokenizer');
    const { readFileSync } = await import('node:fs');
    expect(encode(readFileSync('llms.txt', 'utf8')).length).toBeLessThanOrEqual(GUIDE_TOKENS);
  });

  test(`llms-full.txt is at most ${FULL_GUIDE_TOKENS} tokens`, async () => {
    const { encode } = await import('gpt-tokenizer');
    const { readFileSync } = await import('node:fs');
    expect(encode(readFileSync('llms-full.txt', 'utf8')).length).toBeLessThanOrEqual(FULL_GUIDE_TOKENS);
  });
});

test.describe('visual', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Screenshots are compared in Chromium only');

  for (const scheme of ['light', 'dark']) {
    test(`demo page, ${scheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
      await page.setViewportSize({ width: 1200, height: 900 });
      await page.goto(DEMO);
      await expect(page).toHaveScreenshot(`demo-${scheme}.png`, { fullPage: true });
    });
  }

  test('markdown output on a phone', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(fileUrl('tests/fixtures/markdown.html'));
    await expect(page).toHaveScreenshot('markdown-phone.png', { fullPage: true });
  });
});
