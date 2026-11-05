// Generates the distributable files from tagbrush.css:
//   tagbrush.min.css          minified
//   tagbrush.scoped.css       only styles inside an element with class="tagbrush"
//   tagbrush.scoped.min.css   minified scoped build
//
// tagbrush.css remains the hand-written source of truth and works without this
// step; the build only exists for maintainers. Run with `npm run build`.

import { readFileSync, writeFileSync } from 'node:fs';
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

let scoped = source;
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

write('tagbrush.min.css', minify(source, 'tagbrush.css'));
write('tagbrush.scoped.css', scoped);
write('tagbrush.scoped.min.css', minify(scoped, 'tagbrush.scoped.css'));

for (const file of ['tagbrush.css', 'tagbrush.min.css', 'tagbrush.scoped.css', 'tagbrush.scoped.min.css']) {
  const size = Buffer.byteLength(read(file));
  console.log(`${file.padEnd(26)} ${(size / 1024).toFixed(1)} KB`);
}
