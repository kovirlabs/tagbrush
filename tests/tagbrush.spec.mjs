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
    expect(await style(page, 'button.outline', 'borderTopColor')).toBe('rgb(59, 130, 246)');
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
    expect(await style(page, '.card[data-theme=light] .muted', 'color')).toBe('rgb(107, 114, 128)');
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
    expect(await style(page, '#inside', 'backgroundColor')).toBe('rgb(59, 130, 246)');
    expect(await style(page, '#inside-input', 'display')).toBe('block');
    expect(await style(page, '#scope', 'fontFamily')).toContain('system-ui');
    expect(await style(page, '#outside', 'backgroundColor')).not.toBe('rgb(59, 130, 246)');
    expect(await style(page, 'body', 'marginTop')).toBe('8px');
  });

  test('shadow build styles a shadow root through :host', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await page.goto(fileUrl('tests/fixtures/shadow.html'));
    await page.evaluate(() => Promise.all([...document.querySelectorAll('tb-demo')].map((el) => el.ready)));
    // Playwright locators pierce open shadow roots.
    expect(await style(page, '#light-host button', 'backgroundColor')).toBe('rgb(59, 130, 246)');
    expect(await style(page, '#light-host input', 'display')).toBe('block');
    expect(await style(page, '#light-host main', 'paddingTop')).toBe('24px');
    expect(await style(page, '#light-host', 'display')).toBe('block');
    expect(await style(page, '#light-host', 'fontFamily')).toContain('system-ui');
    expect(await style(page, '#light-host', 'backgroundColor')).toBe('rgb(255, 255, 255)');
    expect(await style(page, '#dark-host', 'backgroundColor')).toBe('rgb(17, 24, 39)');
    // Page CSS aimed at the host element beats the :host defaults inside the shadow root.
    await page.addStyleTag({ content: '#light-host { --color-primary: rgb(16, 185, 129); }' });
    expect(await style(page, '#light-host button', 'backgroundColor')).toBe('rgb(16, 185, 129)');
    expect(await style(page, '#outside', 'backgroundColor')).not.toBe('rgb(59, 130, 246)');
    expect(await style(page, 'body', 'marginTop')).toBe('8px');
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
});
