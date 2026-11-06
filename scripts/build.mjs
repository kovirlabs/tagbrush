// Generates the distributable files from tagbrush.css:
//   tagbrush.min.css          minified
//   tagbrush.scoped.css       only styles inside an element with class="tagbrush"
//   tagbrush.scoped.min.css   minified scoped build
//   tagbrush.shadow.css       for use inside a shadow root (Web Components)
//   tagbrush.shadow.min.css   minified shadow build
//
// tagbrush.css remains the hand-written source of truth and works without this
// step; the build only exists for maintainers. Run with `npm run build`.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { transform } from 'lightningcss';

const root = new URL('../', import.meta.url);
const read = (file) => readFileSync(new URL(file, root), 'utf8');
const write = (file, contents) => writeFileSync(new URL(file, root), contents);

const { version } = JSON.parse(read('package.json'));

// Keep the version in the source header in sync with package.json.
let source = read('tagbrush.css');
const headerPattern = /^ \* TagBrush\.css(?: v[\d.]+(?:-[\w.]+)?)? - /m;
if (!headerPattern.test(source)) {
  throw new Error('Could not find the " * TagBrush.css - " header line in tagbrush.css');
}
source = source.replace(headerPattern, ` * TagBrush.css v${version} - `);
write('tagbrush.css', source);

const banner = `/*! TagBrush.css v${version} | Apache-2.0 | https://github.com/kovirlabs/tagbrush */\n`;

const minify = (css, filename) => {
  const { code } = transform({ filename, code: Buffer.from(css), minify: true });
  return banner + code.toString() + '\n';
};

// ---------------------------------------------------------------------------
// Scoped build: wrap the layer contents in @scope (.tagbrush) and point the
// page-level selectors (:root, html, body) at the scope root instead.
// ---------------------------------------------------------------------------
const replaceExactly = (css, search, replacement, expectedCount) => {
  const count = css.split(search).length - 1;
  if (count !== expectedCount) {
    throw new Error(`Scoped build: expected ${expectedCount} match(es) for ${JSON.stringify(search)}, found ${count}. ` +
      'Update scripts/build.mjs to match the new source.');
  }
  return css.split(search).join(replacement);
};

// The page layout section centers top-level landmarks on a whole page. A scoped
// wrapper or a component sits inside a page someone else lays out, so those
// builds leave it out.
const layoutPattern = /\n {2}\/\* Page layout: start \*\/\n[\s\S]*?\n {2}\/\* Page layout: end \*\/\n/;
if (!layoutPattern.test(source)) {
  throw new Error('Could not find the "Page layout: start/end" markers in tagbrush.css. Update scripts/build.mjs.');
}
const withoutPageLayout = source.replace(layoutPattern, '\n');

let scoped = withoutPageLayout;
scoped = replaceExactly(scoped, '@layer tagbrush {\n', '@layer tagbrush {\n@scope (.tagbrush) {\n', 1);
scoped = scoped.replace(/\}\s*$/, '}\n}\n');
scoped = scoped.replaceAll(':root', ':scope');
scoped = replaceExactly(scoped, '\n  html {', '\n  :scope {', 1);
scoped = replaceExactly(scoped, '\n    html {', '\n    :scope {', 1);
scoped = replaceExactly(scoped, '\n  body {', '\n  :scope {', 1);
scoped = replaceExactly(scoped, 'body > header, body > main, body > footer', ':scope > header, :scope > main, :scope > footer', 1);
scoped = scoped.replace(
  /^\/\*\n \* TagBrush\.css/,
  '/*\n * SCOPED BUILD: styles apply only inside an element with class="tagbrush".\n' +
  ' * Generated from tagbrush.css by scripts/build.mjs. Do not edit directly.\n *\n * TagBrush.css'
);

for (const leftover of [':root', '\n  html', '\n  body', 'body >']) {
  if (scoped.includes(leftover)) {
    throw new Error(`Scoped build still contains "${leftover.trim()}". Update scripts/build.mjs.`);
  }
}

// ---------------------------------------------------------------------------
// Shadow DOM build: for stylesheets adopted inside a shadow root (Lit, Stencil,
// vanilla Web Components, Angular ViewEncapsulation.ShadowDom). Page-level
// selectors point at the shadow host, and data-theme on the host element is
// matched with :host(), because the host is featureless inside its own tree.
// ---------------------------------------------------------------------------
let shadow = withoutPageLayout;
shadow = shadow.replaceAll(':root', ':host');
shadow = replaceExactly(shadow, '\n  html {', '\n  :host {', 1);
shadow = replaceExactly(shadow, '\n    html {', '\n    :host {', 1);
shadow = replaceExactly(shadow, '\n  body {\n    margin: 0;', '\n  :host {\n    display: block;\n    margin: 0;', 1);
shadow = replaceExactly(shadow, 'body > header, body > main, body > footer', ':host > header, :host > main, :host > footer', 1);
shadow = replaceExactly(shadow,
  '  [data-theme="light"] { color-scheme: light; }\n  [data-theme="dark"] { color-scheme: dark; }\n\n  [data-theme] {',
  '  [data-theme="light"], :host([data-theme="light"]) { color-scheme: light; }\n' +
  '  [data-theme="dark"], :host([data-theme="dark"]) { color-scheme: dark; }\n\n  [data-theme], :host([data-theme]) {',
  1);
shadow = shadow.replace(
  /^\/\*\n \* TagBrush\.css/,
  '/*\n * SHADOW DOM BUILD: for use inside a shadow root (Web Components, Lit, Stencil,\n' +
  ' * Angular ShadowDom). Page-level styles apply to :host instead of html/body.\n' +
  ' * Generated from tagbrush.css by scripts/build.mjs. Do not edit directly.\n *\n * TagBrush.css'
);

for (const leftover of ['\n  html', '\n  body', 'body >']) {
  if (shadow.includes(leftover)) {
    throw new Error(`Shadow build still contains "${leftover.trim()}". Update scripts/build.mjs.`);
  }
}

// ---------------------------------------------------------------------------
// Instruction files for AI coding agents, generated from llms.txt so every
// agent gets the same, tested guidance (see tests: llms.txt contract).
// ---------------------------------------------------------------------------
const guide = read('llms.txt').trim();
const generated = '<!-- Generated from llms.txt by scripts/build.mjs. Do not edit directly. -->';
const agentFiles = {
  'ai/claude/tagbrush/SKILL.md': [
    '---',
    'name: tagbrush',
    'description: Write pages styled by TagBrush.css, a classless stylesheet. Use when building or editing HTML pages, prototypes, landing pages, docs, blogs, forms, or dashboards that use TagBrush.css, or when asked for a good-looking page with plain HTML and no CSS framework.',
    '---',
    '',
    generated,
    '',
    guide,
  ].join('\n'),
  'ai/cursor/tagbrush.mdc': [
    '---',
    'description: How to write HTML for TagBrush.css, a classless stylesheet (semantic elements, no classes, no layout CSS)',
    'globs: ["**/*.html", "**/*.htm", "**/*.njk", "**/*.liquid", "**/*.astro", "**/*.vue", "**/*.svelte", "**/*.jsx", "**/*.tsx"]',
    'alwaysApply: false',
    '---',
    '',
    generated,
    '',
    guide,
  ].join('\n'),
  // A section to paste into a project's AGENTS.md or CLAUDE.md: headings move down one level.
  'ai/AGENTS.md': [generated, '', guide.replace(/^(#+) /gm, '#$1 ')].join('\n'),
};
for (const [file, contents] of Object.entries(agentFiles)) {
  mkdirSync(new URL(file.slice(0, file.lastIndexOf('/')), root), { recursive: true });
  write(file, contents + '\n');
}

write('tagbrush.min.css', minify(source, 'tagbrush.css'));
write('tagbrush.scoped.css', scoped);
write('tagbrush.scoped.min.css', minify(scoped, 'tagbrush.scoped.css'));
write('tagbrush.shadow.css', shadow);
write('tagbrush.shadow.min.css', minify(shadow, 'tagbrush.shadow.css'));

for (const file of ['tagbrush.css', 'tagbrush.min.css', 'tagbrush.scoped.css', 'tagbrush.scoped.min.css', 'tagbrush.shadow.css', 'tagbrush.shadow.min.css']) {
  const size = Buffer.byteLength(read(file));
  console.log(`${file.padEnd(26)} ${(size / 1024).toFixed(1)} KB`);
}
