// Measures pages that AI agents wrote for the same requests with different
// styling approaches (see evals/benchmark/README.md) and writes RESULTS.md.
// Maintainer tool: `node scripts/benchmark.mjs`. Needs network for the
// Tailwind CDN; the TagBrush.css CDN link is served from this checkout.

import { chromium } from '@playwright/test';
import { encode } from 'gpt-tokenizer';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { check } from '../bin/tagbrush.mjs';

const DIR = 'evals/benchmark';
const APPROACHES = { tagbrush: 'TagBrush.css', tailwind: 'Tailwind (CDN)', 'plain-css': 'Hand-written CSS' };
// Rules from `tagbrush check` that apply to any page, whatever its styling.
const A11Y_RULES = new Set(['missing-alt', 'unlabeled-field', 'label-for-missing', 'empty-button', 'empty-link', 'clickable-div', 'multiple-main', 'missing-lang']);

const tokens = (text) => encode(text).length;

const contrastFailures = () => {
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
  // Skip text drawn over a gradient or image anywhere behind it (the colors
  // behind it can't be measured reliably), and text inside translucent layers.
  const measurable = (el) => {
    for (let node = el; node; node = node.parentElement) {
      const cs = getComputedStyle(node);
      if (cs.backgroundImage !== 'none' || Number(cs.opacity) < 1) return false;
      if (rgba(cs.backgroundColor)[3] === 1) return true;
    }
    return true;
  };
  const texts = [...document.body.querySelectorAll('*')].filter((el) =>
    [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && el.checkVisibility() &&
    !el.closest(':disabled, [aria-disabled="true"], dialog:not([open]), [popover]:not(:popover-open)') &&
    measurable(el));
  let failing = 0;
  const examples = [];
  for (const el of texts) {
    const bg = backdrop(el);
    const fg = over(rgba(getComputedStyle(el).color), bg);
    const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
    const size = parseFloat(getComputedStyle(el).fontSize);
    const bold = Number(getComputedStyle(el).fontWeight) >= 700;
    const required = size >= 24 || (bold && size >= 18.66) ? 3 : 4.5; // WCAG large text
    const ratio = (hi + 0.05) / (lo + 0.05);
    if (ratio < required) { failing++; examples.push(`${el.localName} "${el.textContent.trim().slice(0, 30)}" ${ratio.toFixed(2)}`); }
  }
  return { failing, total: texts.length, examples: examples.slice(0, 6) };
};

const browser = await chromium.launch();
const measure = async (file) => {
  const html = readFileSync(`${DIR}/${file}`, 'utf8');
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.route(/cdn\.jsdelivr\.net\/npm\/tagbrush@1\/tagbrush(\.min)?\.css/, (route) =>
    route.fulfill({ path: 'tagbrush.css', contentType: 'text/css' }));
  const url = pathToFileURL(resolve(DIR, file)).href;
  const render = async (scheme, width) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
  };

  await render('light', 1280);
  const text = await page.evaluate(() => document.body.innerText);
  const lightBackground = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const overflowDesktop = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  const contrastLight = await page.evaluate(contrastFailures);
  await render('dark', 1280);
  const darkBackground = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const contrastDark = await page.evaluate(contrastFailures);
  await render('light', 360);
  const overflowPhone = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  await page.close();

  const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g), ...html.matchAll(/\sstyle="([^"]*)"/g)].map((m) => m[1]).join('\n');
  const classes = [...html.matchAll(/\sclass="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/).filter(Boolean));
  const total = tokens(html);
  const textTokens = tokens(text);
  return {
    file,
    total,
    textTokens,
    overhead: total - textTokens,
    cssTokens: tokens(css),
    classes: classes.length,
    classTokens: tokens(classes.join(' ')),
    svgTokens: tokens([...html.matchAll(/<svg[\s\S]*?<\/svg>/g)].map((m) => m[0]).join('')),
    darkMode: lightBackground !== darkBackground,
    overflowPhone,
    overflowDesktop,
    contrastLight: contrastLight.failing,
    contrastDark: contrastDark.failing,
    contrastExamples: { light: contrastLight.examples, dark: contrastDark.examples },
    a11yErrors: check(html).filter((p) => A11Y_RULES.has(p.rule)).map((p) => p.rule),
  };
};

const files = readdirSync(DIR).filter((f) => f.endsWith('.html')).sort();
const results = [];
for (const file of files) results.push(await measure(file));
await browser.close();

const requests = [...new Set(files.map((f) => f.split('.')[0]))];
const row = (r) => {
  const approach = APPROACHES[r.file.split('.')[1]] ?? r.file;
  const perText = ((r.overhead - r.svgTokens) / r.textTokens).toFixed(1);
  return `| ${approach} | ${r.total.toLocaleString('en-US')} | ${r.textTokens.toLocaleString('en-US')} | ${r.svgTokens.toLocaleString('en-US')} | ${perText} | ${r.classes} | ${r.cssTokens.toLocaleString('en-US')} | ${r.darkMode ? 'yes' : 'no'} | ${r.overflowPhone ? 'yes' : 'no'} | ${r.contrastLight} / ${r.contrastDark} | ${r.a11yErrors.length} |`;
};
let md = `# Benchmark results

Generated by \`node scripts/benchmark.mjs\`. Tokens are counted with the GPT-4o tokenizer (\`gpt-tokenizer\`) as a stand-in for any model's tokenizer; compare the approaches with each other rather than reading the numbers as exact Claude token counts.

- **Output tokens:** the whole HTML file, which is what the agent had to generate.
- **Visible text tokens:** the words a visitor reads. Pages with more copy need more markup in any approach.
- **Inline SVG tokens:** icons, logos, and charts drawn in SVG, a sign of extra design ambition rather than styling cost.
- **Markup per text token (without SVG):** (output tokens − visible text − SVG) ÷ visible text. The fairest comparison of what each approach costs per word of content.
- **Contrast failures:** text below WCAG AA (4.5:1, or 3:1 for large text), in light / dark mode. Text over background images is skipped.
- **A11y errors:** from \`npx tagbrush check\`, counting only rules that apply to any page (missing alt text or labels, empty buttons and links, clickable divs, missing lang).
`;
for (const request of requests) {
  md += `\n## ${request}\n\n| Approach | Output tokens | Visible text tokens | Inline SVG tokens | Markup per text token (without SVG) | Classes | CSS tokens | Dark mode | Overflows on a phone | Contrast failures (light / dark) | A11y errors |\n|---|---:|---:|---:|---:|---:|---:|---|---|---|---:|\n`;
  for (const r of results.filter((r) => r.file.startsWith(`${request}.`))) md += row(r) + '\n';
}
writeFileSync(`${DIR}/RESULTS.md`, md);
writeFileSync(`${DIR}/results.json`, JSON.stringify(results, null, 2) + '\n');
console.log(md);
