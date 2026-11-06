import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const fileUrl = (path) => pathToFileURL(resolve(path)).href;
const DEMO = fileUrl('index.html');

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
    expect(await style(page, 'button.secondary', 'backgroundColor')).toBe('rgb(243, 244, 246)');
    expect(await style(page, 'button[type=reset]', 'backgroundColor')).toBe('rgb(243, 244, 246)');
    expect(await style(page, 'button.outline', 'borderTopColor')).toBe('rgb(37, 99, 235)');
  });

  test('nav lists, current page, and menu toolbars', async ({ page }) => {
    expect(await style(page, 'nav[aria-label="Example site"] ul', 'display')).toBe('flex');
    expect(await style(page, 'nav [aria-current="page"]', 'fontWeight')).toBe('600');
    expect(await style(page, 'nav [aria-current="page"]', 'color')).toBe('rgb(31, 41, 55)');
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
    expect(await style(page, 'body', 'backgroundColor')).toBe('rgb(17, 24, 39)');
  });

  test('data-theme forces a scheme on a subtree', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto(DEMO);
    expect(await style(page, '.card[data-theme=dark] .muted', 'color')).toBe('rgb(156, 163, 175)');
    expect(await style(page, '.card[data-theme=light] .muted', 'color')).toBe('rgb(100, 107, 118)');
  });

  test('switcher on the demo page sets data-theme on <html>', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto(DEMO);
    await page.selectOption('#theme-select', 'dark');
    expect(await style(page, 'body', 'backgroundColor')).toBe('rgb(17, 24, 39)');
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
    expect(await style(page, '#dark-host', 'backgroundColor')).toBe('rgb(17, 24, 39)');
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

  test('a page without <main> is centered as a whole', async ({ page }) => {
    await load(page, '<h1>Markdown title</h1><p>Paragraph</p><pre>code</pre>');
    expect(await style(page, 'body', 'paddingLeft')).toBe('56px');
    expect(await style(page, 'body', 'display')).toBe('block');
    expect(await rect(page, 'pre')).toMatchObject({ left: 56, width: 1168 });
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

  test('a class on the wrapper means it is the author\'s own layout', async ({ page }) => {
    await load(page, `<div class="grid">${PAGE}</div>`);
    expect(await style(page, 'main', 'paddingLeft')).toBe('0px');
    expect(await style(page, '.grid', 'display')).toBe('grid');
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

test.describe('accessibility', () => {
  // WCAG AA asks for 4.5:1 between normal-size text and its background.
  const AA = 4.5;

  for (const scheme of ['light', 'dark']) {
    test(`default text colors meet WCAG AA contrast, ${scheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
      await page.goto(fileUrl('tests/fixtures/contrast.html'));
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
      expect(failing, `below ${AA}:1 in ${scheme} mode`).toEqual([]);
    });
  }
});

test.describe('size budget', () => {
  // TagBrush.css favors covering more HTML over shaving bytes, but stays small.
  const BUDGET = 10 * 1024;

  test.skip(({ browserName }) => browserName !== 'chromium', 'File size is the same in every browser');

  test(`tagbrush.min.css is at most ${BUDGET / 1024} KB gzipped`, async () => {
    const { gzipSync } = await import('node:zlib');
    const { readFileSync } = await import('node:fs');
    const size = gzipSync(readFileSync('tagbrush.min.css'), { level: 9 }).length;
    expect(size).toBeLessThanOrEqual(BUDGET);
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
