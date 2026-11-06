#!/usr/bin/env node
// TagBrush.css command line: `npx tagbrush check page.html [more files or folders]`
//
// Reports HTML that TagBrush.css can't make look right or that hurts
// accessibility, for people and for AI agents that can't take screenshots.
// No dependencies: a small HTML scanner is enough for these checks.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

// Classes TagBrush.css styles. Anything else is probably invented.
const KNOWN_CLASSES = new Set(['button', 'secondary', 'outline', 'container', 'grid', 'card', 'striped', 'visually-hidden', 'tagbrush']);
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const RAW_TEXT = new Set(['script', 'style', 'textarea', 'title']);
const NAMED_BY_ATTRIBUTE = ['aria-label', 'aria-labelledby', 'title'];

const TAG = /<!--[\s\S]*?-->|<!doctype[^>]*>|<(\/?)([a-zA-Z][\w-]*)((?:\s+[^\s"'>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*\/?>/gi;
const ATTRIBUTE = /([^\s"'>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

/** Parse HTML into a flat list of elements with parents, attributes, and text. */
export function parse(html) {
  const elements = [];
  const stack = [];
  let last = 0;
  const addText = (text) => {
    if (!text.trim()) return;
    for (const open of stack) open.text += text;
  };
  TAG.lastIndex = 0;
  let match;
  while ((match = TAG.exec(html))) {
    addText(html.slice(last, match.index));
    last = TAG.lastIndex;
    const [, closing, rawName, rawAttributes] = match;
    if (!rawName) continue; // comment or doctype
    const name = rawName.toLowerCase();
    if (closing) {
      const index = stack.map((e) => e.name).lastIndexOf(name);
      if (index !== -1) stack.length = index;
      continue;
    }
    const attributes = {};
    for (const [, key, double, single, bare] of (rawAttributes || '').matchAll(ATTRIBUTE)) {
      attributes[key.toLowerCase()] = double ?? single ?? bare ?? '';
    }
    const element = { name, attributes, parent: stack.at(-1) ?? null, index: match.index, text: '', children: [] };
    element.parent?.children.push(element);
    elements.push(element);
    if (RAW_TEXT.has(name)) {
      const end = html.toLowerCase().indexOf(`</${name}`, TAG.lastIndex);
      const stop = end === -1 ? html.length : end;
      element.text = html.slice(TAG.lastIndex, stop);
      TAG.lastIndex = last = stop;
      continue;
    }
    if (!VOID.has(name) && !match[0].endsWith('/>')) stack.push(element);
  }
  return elements;
}

const ancestors = function* (element) {
  for (let node = element.parent; node; node = node.parent) yield node;
};
const has = (element, ...names) => names.some((name) => name in element.attributes);
const hasName = (element) => NAMED_BY_ATTRIBUTE.some((name) => (element.attributes[name] ?? '').trim());
// Text, or an image with alt text, gives a button or link a name.
const hasContent = (element) => element.text.trim() !== '' ||
  element.children.some((child) => (child.name === 'img' && (child.attributes.alt ?? '').trim()) || hasName(child) || hasContent(child));
const nonVariableDeclarations = (css) => [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/(?:^|[;{\s])([a-z-]+)\s*:(?!:)/g)]
  .map((m) => m[1]).filter((property) => !property.startsWith('--') && property !== 'color-scheme');

/** Check one HTML document. Returns a list of { line, level, rule, message }. */
export function check(html) {
  const elements = parse(html);
  const problems = [];
  const lineOf = (index) => html.slice(0, index).split('\n').length;
  const report = (element, level, rule, message) => problems.push({ line: element ? lineOf(element.index) : 1, level, rule, message });

  const ids = new Map();
  for (const element of elements) {
    const id = element.attributes.id;
    if (id) ids.set(id, (ids.get(id) ?? 0) + 1);
  }
  const labelTargets = new Set(elements.filter((e) => e.name === 'label' && e.attributes.for).map((e) => e.attributes.for));

  const html_ = elements.find((e) => e.name === 'html');
  if (html_ && !(html_.attributes.lang ?? '').trim()) report(html_, 'error', 'missing-lang', '<html> needs a lang attribute, for example lang="en"');
  if (html_ && !elements.some((e) => e.name === 'meta' && e.attributes.name === 'viewport')) {
    report(html_, 'warning', 'missing-viewport', 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> so the page fits phones');
  }
  if (html_ && !elements.some((e) => e.name === 'link' && /tagbrush/i.test(e.attributes.href ?? ''))) {
    report(html_, 'warning', 'missing-stylesheet', 'No <link> to TagBrush.css found (fine if your framework imports it)');
  }

  const mains = elements.filter((e) => e.name === 'main' && !has(e, 'hidden'));
  for (const extra of mains.slice(1)) report(extra, 'error', 'multiple-main', 'A page should have only one visible <main>');

  let previousHeading = 0;
  for (const element of elements) {
    const { name, attributes } = element;
    const inCode = [...ancestors(element)].some((a) => a.name === 'pre' || a.name === 'code');

    if (name === 'img' && !('alt' in attributes)) {
      report(element, 'error', 'missing-alt', `<img src="${attributes.src?.slice(0, 40) ?? ''}"> needs alt text (alt="" if it's decorative)`);
    }

    const isField = (name === 'input' && !['hidden', 'submit', 'button', 'reset', 'image'].includes((attributes.type ?? 'text').toLowerCase())) ||
      name === 'select' || name === 'textarea';
    if (isField && !hasName(element) && ![...ancestors(element)].some((a) => a.name === 'label') && !labelTargets.has(attributes.id)) {
      report(element, 'error', 'unlabeled-field', `<${name}${attributes.name ? ` name="${attributes.name}"` : ''}> has no label: use <label for="…">, wrap it in <label>, or add aria-label`);
    }

    if (name === 'label' && attributes.for && !ids.has(attributes.for)) {
      report(element, 'error', 'label-for-missing', `<label for="${attributes.for}"> points to an id that doesn't exist`);
    }

    if (name === 'button' && !hasName(element) && !hasContent(element)) {
      report(element, 'error', 'empty-button', '<button> has no text: add text or aria-label');
    }
    if (name === 'a' && 'href' in attributes && !hasName(element) && !hasContent(element)) {
      report(element, 'error', 'empty-link', `<a href="${attributes.href.slice(0, 40)}"> has no text: add text or aria-label`);
    }

    if ((name === 'div' || name === 'span') && 'onclick' in attributes) {
      report(element, 'error', 'clickable-div', `<${name} onclick> isn't reachable by keyboard: use <button>`);
    }

    if (attributes.class !== undefined && !inCode) {
      const unknown = attributes.class.split(/\s+/).filter((c) => c && !KNOWN_CLASSES.has(c));
      if (unknown.length) report(element, 'warning', 'unknown-class', `class="${unknown.join(' ')}" isn't used by TagBrush.css: semantic HTML usually does the job`);
    }

    if (attributes.style !== undefined) {
      const properties = nonVariableDeclarations(`{${attributes.style}}`);
      if (properties.length) report(element, 'warning', 'inline-style', `style sets ${properties.join(', ')}: only CSS variables should be needed`);
    }
    if (name === 'style') {
      const properties = [...new Set(nonVariableDeclarations(element.text))];
      if (properties.length) report(element, 'warning', 'style-block', `<style> sets ${properties.slice(0, 5).join(', ')}${properties.length > 5 ? ', …' : ''}: TagBrush.css only needs CSS variables`);
    }

    const level = /^h([1-6])$/.exec(name)?.[1];
    if (level) {
      if (previousHeading && Number(level) > previousHeading + 1) {
        report(element, 'warning', 'heading-skip', `<${name}> follows <h${previousHeading}>: don't skip heading levels`);
      }
      previousHeading = Number(level);
    }
  }

  for (const [id, count] of ids) {
    if (count > 1) report(elements.find((e) => e.attributes.id === id), 'warning', 'duplicate-id', `id="${id}" is used ${count} times`);
  }
  return problems.sort((a, b) => a.line - b.line);
}

const htmlFiles = (path) => statSync(path).isDirectory()
  ? readdirSync(path).filter((f) => !f.startsWith('.') && f !== 'node_modules').flatMap((f) => htmlFiles(join(path, f)))
  : /\.html?$/i.test(path) ? [path] : [];

function main(args) {
  const [command, ...rest] = args;
  const json = rest.includes('--json');
  const strict = rest.includes('--strict');
  const paths = rest.filter((a) => !a.startsWith('--'));
  if (command !== 'check' || paths.length === 0) {
    console.log(`Usage: npx tagbrush check <file.html | folder>... [--json] [--strict]

Checks HTML written for TagBrush.css: missing alt text and labels, empty
buttons and links, clickable divs, invented classes, layout CSS, skipped
headings, and page basics (lang, viewport, stylesheet link).

  --json     print results as JSON
  --strict   also fail (exit code 1) on warnings`);
    return command === 'check' || command === undefined || command === '--help' ? 0 : 2;
  }

  const results = paths.flatMap(htmlFiles).map((file) => ({ file: relative(process.cwd(), file), problems: check(readFileSync(file, 'utf8')) }));
  const errors = results.reduce((n, r) => n + r.problems.filter((p) => p.level === 'error').length, 0);
  const warnings = results.reduce((n, r) => n + r.problems.filter((p) => p.level === 'warning').length, 0);

  if (json) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    for (const { file, problems } of results) {
      for (const p of problems) console.log(`${file}:${p.line}  ${p.level === 'error' ? 'error  ' : 'warning'}  ${p.rule.padEnd(18)} ${p.message}`);
    }
    console.log(`${results.length} file${results.length === 1 ? '' : 's'} checked: ${errors} error${errors === 1 ? '' : 's'}, ${warnings} warning${warnings === 1 ? '' : 's'}`);
  }
  return errors > 0 || (strict && warnings > 0) ? 1 : 0;
}

// Run only when executed (directly or through the npm bin link), not when imported.
const invokedPath = process.argv[1] ?? '';
if (invokedPath && (import.meta.url === pathToFileURL(invokedPath).href || /[\\/]tagbrush(\.cmd)?$/.test(invokedPath))) {
  process.exitCode = main(process.argv.slice(2));
}
