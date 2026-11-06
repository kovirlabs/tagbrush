---
name: tagbrush
description: Write pages styled by TagBrush.css, a classless stylesheet. Use when building or editing HTML pages, prototypes, landing pages, docs, blogs, forms, or dashboards that use TagBrush.css, or when asked for a good-looking page with plain HTML and no CSS framework.
---

<!-- Generated from llms.txt by scripts/build.mjs. Do not edit directly. -->

# TagBrush.css

> A classless CSS library: one stylesheet that makes plain, semantic HTML look finished. No classes, no build step, no JavaScript. Dark mode, readable colors for any brand color, and page layout are automatic. Write standard HTML elements and ARIA attributes; do not invent class names.

Add this to `<head>`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tagbrush@1/tagbrush.min.css">
```

## Rules for writing pages

- Use semantic elements instead of classes or `<div>` wrappers. Styling comes from the element, not from classes.
- Do not add utility classes (Tailwind, Bootstrap) or inline layout styles. They are not needed.
- Do not write CSS for layout, spacing, colors, or dark mode unless asked. Theme with the variables below if a brand color or font is requested.
- Use `<header>`, `<main>`, and `<footer>` as direct children of `<body>`. They are centered automatically and the footer stays at the bottom.

## Page structure

- `<header><nav><strong>Site name</strong><ul><li><a href="/" aria-current="page">Home</a></li>…</ul></nav></header>`: a top bar. Lists inside `<nav>` are horizontal; `aria-current="page"` marks the current page.
- `<main>`: page content, centered at 1200px. A `<main>` with a single `<article>` (a blog post, a docs page) is kept at a 70-character reading width.
- A page with no `<main>` (for example Markdown output) is centered at reading width.
- `<footer>`: muted, small text.
- `<hgroup><h1>Title</h1><p>Subtitle</p></hgroup>`: a heading with a muted subtitle.
- `<section><h2>Heading</h2><article>…</article><article>…</article></section>`: two or more `<article>`s in a `<section>` become a responsive grid of cards. Only headings, `hgroup`, `p`, `header`, and `footer` may sit beside the articles.
- `<article><aside>Note</aside></article>`: an `<aside>` inside an article is a highlighted callout.
- `<nav aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a aria-current="page">Page</a></li></ol></nav>`: breadcrumbs with separators.

## Components from HTML and ARIA

- Buttons: `<button>`. Secondary: `class="secondary"`. Outline: `class="outline"`. A link styled as a button: `<a class="button" href="…">`. These three are the only classes needed for buttons.
- A row of buttons, or an input with a button (a search bar): wrap them in `<div role="group">`.
- Toggle switch: `<label><input type="checkbox" role="switch"> Label</label>`.
- Loading: `aria-busy="true"` on a button or any element shows a spinner.
- Accordion: neighboring `<details><summary>Question</summary><p>Answer</p></details>`. Give them the same `name="…"` so only one opens at a time.
- Modal: `<dialog><form method="dialog"><header><h2>Title</h2><button aria-label="Close">✕</button></header><p>…</p><footer><button class="secondary" value="cancel">Cancel</button><button value="ok">OK</button></footer></form></dialog>`, opened with `dialog.showModal()`.
- Popover: `<button popovertarget="tip">?</button><div popover id="tip">…</div>`.
- Progress: `<progress value="40" max="100">`. Meter (turns green, amber, red): `<meter value="0.7" low="0.5" high="0.8" optimum="0.2">`.

## Forms

- `<label for="email">Email</label><input type="email" id="email">`, or wrap the input in its `<label>`. Fields are full width and spaced automatically.
- Help text: a `<small>` directly after the field.
- Errors: `aria-invalid="true"` on the field (and its `<small>` turns red). Valid: `aria-invalid="false"`.
- Checkboxes and radios: `<label><input type="checkbox"> Text</label>`.
- `<textarea>` without a `rows` attribute grows as the user types. `readonly` and `disabled` fields are styled.
- Group related fields in `<fieldset><legend>Title</legend>…</fieldset>`.

## Content

- Tables: plain `<table>` with `<thead>`/`<tbody>`. Wide tables scroll inside themselves. Wrap in `<figure>` to fill the width. Zebra rows: `class="striped"`.
- Code: `<pre><code>`. Highlighting classes from Prism, highlight.js, Shiki, Hugo, Jekyll, and Pandoc are colored automatically.
- Images: `<figure><img src="…" alt="…"><figcaption>Caption</figcaption></figure>`.
- Quotes: `<blockquote><p>…</p><footer>Author</footer></blockquote>`.
- Inline: `<mark>`, `<kbd>`, `<code>`, `<abbr title="…">`, `<del>`, `<ins>`, `<small>`.

## Optional classes

Only when needed: `.container` (center content inside a full-width element), `.grid` (equal columns for any children), `.card` (a boxed panel), `.striped`, `.visually-hidden`, and the button classes above.

## Theming

Override variables in a `<style>` block. Colors take a light and a dark value with `light-dark()`:

```css
:root {
  --color-primary: #7c3aed;          /* buttons, links, focus; text on buttons stays readable automatically */
  --font-family-base: Georgia, serif;
  --border-radius: 0.75rem;
  --spacing: 1.25rem;                /* scales all spacing */
  --color-background: light-dark(#fffdf7, #14110f);
}
```

To force light or dark: `<html data-theme="light">` or `data-theme="dark"` on any element. To lay out a page yourself instead: `<body data-layout="full">`.

## Links

- [README](https://github.com/kovirlabs/tagbrush#readme): full documentation and the list of variables
- [Live demo and theme builder](https://kovirlabs.github.io/tagbrush/)
- [starter.html](https://github.com/kovirlabs/tagbrush/blob/main/starter.html): a complete example page
