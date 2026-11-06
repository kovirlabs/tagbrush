<!-- Generated from llms.txt by scripts/build.mjs. Do not edit directly. -->

## TagBrush.css

> A classless CSS library: one stylesheet that makes plain, semantic HTML look finished. No classes, no build step, no JavaScript. Dark mode, readable colors for any brand color, and page layout are automatic. Write standard HTML elements and ARIA attributes; do not invent class names.

Add this to `<head>`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tagbrush@1/tagbrush.min.css">
```

### Rules for writing pages

- Use semantic elements instead of classes or `<div>` wrappers. Styling comes from the element, not from classes.
- Do not add utility classes (Tailwind, Bootstrap) or inline layout styles. They are not needed.
- Do not write CSS for layout, spacing, colors, or dark mode unless asked. Theme with the variables below if a brand color or font is requested.
- Use `<header>`, `<main>`, and `<footer>` as direct children of `<body>`. They are centered automatically and the footer stays at the bottom.

### Page structure

- `<header><nav><strong>Site name</strong><ul><li><a href="/" aria-current="page">Home</a></li>…</ul></nav></header>`: a top bar. Lists inside a `<nav>` are horizontal rows (top bar, footer links, pagination), except inside an `<aside>`, where they're vertical; `aria-current="page"` marks the current page.
- Hero (landing pages): `<header><nav>…</nav><hgroup><h1>Big promise</h1><p>Supporting line</p></hgroup><div role="group"><a class="button" href="/signup">Start free</a><a class="button outline" href="/tour">Take the tour</a></div></header>`: an `<hgroup>` in the page header after the `<nav>` becomes a large, centered hero.
- `<nav aria-label="Pagination"><ul><li><a rel="prev" href="…">← Previous</a></li><li><a rel="next" href="…">Next →</a></li></ul></nav>`: previous/next links; the `rel="next"` link sits at the far end of the row. Add numbered page links between them if needed.
- `<main>`: page content, centered at 1200px. A `<main>` with a single `<article>` (a blog post, a docs page) is kept at a 70-character reading width.
- A page with no `<main>` (for example Markdown output) is centered at reading width.
- `<footer>`: muted, small text.
- Sidebar layout (apps, dashboards, admin pages): `<body><header>…</header><aside><nav aria-label="Sections"><ul><li><a href="/" aria-current="page">Dashboard</a></li>…</ul></nav></aside><main>…</main><footer>…</footer></body>`. An `<aside>` next to `<main>` becomes a sidebar column (stacked on phones), and main uses the full width.
- Docs page with a table of contents: `<main><aside><nav aria-label="On this page"><ul><li><a href="#install">Install</a></li>…</ul></nav></aside><article>…</article></main>`. The aside stays in view beside the article.
- `<hgroup><h1>Title</h1><p>Subtitle</p></hgroup>`: a heading with a muted subtitle.
- `<section><h2>Heading</h2><article>…</article><article>…</article></section>`: two or more `<article>`s in a `<section>` become a responsive grid of cards. Only headings, `hgroup`, `p`, `header`, and `footer` may sit beside the articles.
- `<article><aside>Note</aside></article>`: an `<aside>` anywhere inside an `<article>` (also between its sections) is a highlighted callout. Start it with a bold word, such as "Warning:", to label it.
- A page that is one form (sign-up, contact, settings): put the `<form>` inside an `<article>` in `<main>` to get a narrow, centered column.
- `<nav aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a aria-current="page">Page</a></li></ol></nav>`: breadcrumbs with separators.

### Components from HTML and ARIA

- Buttons: `<button>`. Secondary: `class="secondary"`. Outline: `class="outline"`. A link styled as a button: `<a class="button" href="…">`. These three are the only classes needed for buttons.
- A row of buttons, or an input with a button (a search bar): wrap them in `<div role="group">`. Inputs and `<select>`s in the group share the row.
- Short status labels (in tables, next to headings): `<mark>`. Changes up or down: `<ins>` and `<del>`.
- Key numbers (stat tiles): `<dl><div><dt>Revenue</dt><dd>$84,312</dd><dd><ins>+12%</ins> vs. last month</dd></div><div><dt>Orders</dt><dd>1,148</dd></div></dl>`. A `<dl>` whose items are wrapped in `<div>`s becomes a row of tiles; a plain `<dl>` stays a list.
- A title with actions: `<header><h1>Users</h1><button>Invite user</button></header>` inside `<main>`, an `<article>`, or a `<section>` puts the buttons on the same row as the heading.
- Search and filters above a list or table: `<search><input type="search" aria-label="Search users"><select aria-label="Role"><option>All roles</option></select><button>Filter</button></search>` lays the fields out in a row.
- Toggle switch: `<label><input type="checkbox" role="switch"> Label</label>`.
- Loading: `aria-busy="true"` on a button or any element shows a spinner.
- Accordion: neighboring `<details><summary>Question</summary><p>Answer</p></details>`. Give them the same `name="…"` so only one opens at a time.
- Modal: `<dialog><form method="dialog"><header><h2>Title</h2><button aria-label="Close">✕</button></header><p>…</p><footer><button class="secondary" value="cancel">Cancel</button><button value="ok">OK</button></footer></form></dialog>`, opened with `dialog.showModal()`.
- Popover: `<button popovertarget="tip">?</button><div popover id="tip">…</div>`.
- Progress: `<progress value="40" max="100">`. Meter (turns green, amber, red): `<meter value="0.7" low="0.5" high="0.8" optimum="0.2">`.

### Forms

- `<label for="email">Email</label><input type="email" id="email">`, or wrap the input in its `<label>`. Fields are full width and spaced automatically.
- Help text: a `<small>` directly after the field.
- Errors: `aria-invalid="true"` on the field (and its `<small>` turns red). Valid: `aria-invalid="false"`.
- Checkboxes and radios: `<label><input type="checkbox"> Text</label>`.
- `<textarea>` without a `rows` attribute grows as the user types. `readonly` and `disabled` fields are styled.
- Group related fields in `<fieldset><legend>Title</legend>…</fieldset>`.

### Content

- Tables: plain `<table>` with `<thead>`/`<tbody>`. Wide tables scroll inside themselves. Wrap in `<figure>` to fill the width. Zebra rows: `class="striped"`.
- Code: `<pre><code>`. Highlighting classes from Prism, highlight.js, Shiki, Hugo, Jekyll, and Pandoc are colored automatically.
- Images: `<figure><img src="…" alt="…"><figcaption>Caption</figcaption></figure>`.
- Quotes: `<blockquote><p>…</p><footer>Author</footer></blockquote>`.
- Inline: `<mark>`, `<kbd>`, `<code>`, `<abbr title="…">`, `<del>`, `<ins>`, `<small>`.

### Optional classes

Only when needed: `.container` (center content inside a full-width element), `.grid` (equal columns for any children), `.card` (a boxed panel), `.striped`, `.visually-hidden`, and the button classes above.

### Theming

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

### Checking your work

Add `data-tagbrush="debug"` to `<html>` while working, then look at the page (or a screenshot). Red dashed outlines mark images without `alt`, form fields without a label, buttons or links without text, and clickable `<div>`/`<span>` elements; amber dotted outlines mark classes TagBrush.css doesn't use and inline styles that aren't CSS variables. Fix them, then remove the attribute.

### Links

- [README](https://github.com/kovirlabs/tagbrush#readme): full documentation and the list of variables
- [Live demo and theme builder](https://kovirlabs.github.io/tagbrush/)
- [starter.html](https://github.com/kovirlabs/tagbrush/blob/main/starter.html): a complete example page
