// Measures pages that AI agents wrote for the same requests with different
// styling approaches (see evals/benchmark/README.md) and writes RESULTS.md.
// Maintainer tool: `node scripts/benchmark.mjs [folder]` (default
// evals/benchmark). Needs network for the
// Tailwind CDN; the TagBrush.css CDN link is served from this checkout.

import { chromium } from '@playwright/test';
import { encode } from 'gpt-tokenizer';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { check } from '../bin/tagbrush.mjs';

const DIR = process.argv[2] ?? 'evals/benchmark';
const APPROACHES = { tagbrush: 'TagBrush.css', 'tagbrush-plus': 'TagBrush.css + small CSS', tailwind: 'Tailwind (CDN)', 'plain-css': 'Hand-written CSS' };
// A re-run folder inside a benchmark (evals/benchmark-2/rerun) uses its parent's reference.
const referenceFile = (request) => [`${DIR}/reference/${request}-1.png`, `${DIR}/../reference/${request}-1.png`].find((f) => existsSync(f));
const hasReference = (request) => Boolean(referenceFile(request));
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
  await page.evaluate(() => scrollTo(0, 0));
  // Rough visual similarity of the first screen to the reference design:
  // both shrunk to 128x100 grayscale, 1 − mean absolute difference.
  const request = file.split('.')[0];
  let similarity = null;
  if (hasReference(request)) {
    const shot = (await page.screenshot({ clip: { x: 0, y: 0, width: 1280, height: 1000 } })).toString('base64');
    const reference = readFileSync(referenceFile(request)).toString('base64');
    similarity = await page.evaluate(async ([a, b]) => {
      const pixels = async (data) => {
        const img = new Image();
        img.src = `data:image/png;base64,${data}`;
        await img.decode();
        const canvas = new OffscreenCanvas(128, 100);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 1280, 1000, 0, 0, 128, 100);
        const d = ctx.getImageData(0, 0, 128, 100).data;
        const gray = [];
        for (let i = 0; i < d.length; i += 4) gray.push(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
        return gray;
      };
      const [x, y] = await Promise.all([pixels(a), pixels(b)]);
      return 1 - x.reduce((sum, v, i) => sum + Math.abs(v - y[i]), 0) / x.length / 255;
    }, [shot, reference]);
  }
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
    similarity,
  };
};

const files = readdirSync(DIR).filter((f) => f.endsWith('.html')).sort();
if (!files.length) throw new Error(`No pages in ${DIR}`);
const results = [];
for (const file of files) results.push(await measure(file));
await browser.close();

const requests = [...new Set(files.map((f) => f.split('.')[0]))];
const row = (r) => {
  const approach = APPROACHES[r.file.split('.')[1]] ?? r.file;
  const perText = ((r.overhead - r.svgTokens) / r.textTokens).toFixed(1);
  const similar = r.similarity === null ? '' : ` ${(r.similarity * 100).toFixed(1)}% |`;
  return `| ${approach} | ${r.total.toLocaleString('en-US')} | ${r.textTokens.toLocaleString('en-US')} | ${r.svgTokens.toLocaleString('en-US')} | ${perText} | ${r.classes} | ${r.cssTokens.toLocaleString('en-US')} | ${r.darkMode ? 'yes' : 'no'} | ${r.overflowPhone ? 'yes' : 'no'} | ${r.contrastLight} / ${r.contrastDark} | ${r.a11yErrors.length} |${similar}`;
};
let md = `# Benchmark results

Generated by \`node scripts/benchmark.mjs\`. Tokens are counted with the GPT-4o tokenizer (\`gpt-tokenizer\`) as a stand-in for any model's tokenizer; compare the approaches with each other rather than reading the numbers as exact Claude token counts.

- **Output tokens:** the whole HTML file, which is what the agent had to generate.
- **Visible text tokens:** the words a visitor reads. Pages with more copy need more markup in any approach.
- **Inline SVG tokens:** icons, logos, and charts drawn in SVG, a sign of extra design ambition rather than styling cost.
- **Markup per text token (without SVG):** (output tokens − visible text − SVG) ÷ visible text. The fairest comparison of what each approach costs per word of content.
- **Contrast failures:** text below WCAG AA (4.5:1, or 3:1 for large text), in light / dark mode. Text over background images is skipped.
- **A11y errors:** from \`npx tagbrush check\`, counting only rules that apply to any page (missing alt text or labels, empty buttons and links, clickable divs, missing lang).
- **Similarity to reference** (when the folder has one): the first 1280×1000 screen and the reference's, both shrunk to 128×100 grayscale, as 1 − mean pixel difference. A rough signal only; compare the screenshots for real fidelity.
`;
for (const request of requests) {
  const ref = hasReference(request);
  md += `\n## ${request}\n\n| Approach | Output tokens | Visible text tokens | Inline SVG tokens | Markup per text token (without SVG) | Classes | CSS tokens | Dark mode | Overflows on a phone | Contrast failures (light / dark) | A11y errors |${ref ? ' Similarity to reference (first screen) |' : ''}\n|---|---:|---:|---:|---:|---:|---:|---|---|---|---:|${ref ? '---:|' : ''}\n`;
  for (const r of results.filter((r) => r.file.startsWith(`${request}.`))) md += row(r) + '\n';
}
writeFileSync(`${DIR}/RESULTS.md`, md);
writeFileSync(`${DIR}/results.json`, JSON.stringify(results, null, 2) + '\n');
console.log(md);
