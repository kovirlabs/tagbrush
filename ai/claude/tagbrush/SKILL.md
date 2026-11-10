---
name: tagbrush
description: Write pages styled by TagBrush.css, a classless stylesheet. Use when building or editing HTML pages, prototypes, landing pages, docs, blogs, forms, or dashboards that use TagBrush.css, or when asked for a good-looking page with plain HTML and no CSS framework.
---

<!-- Generated from llms.txt and llms/ by scripts/build.mjs. Do not edit directly. -->

# TagBrush.css

> A classless CSS library: one stylesheet that makes plain, semantic HTML look finished. No classes, no build step, no JavaScript. Dark mode, readable colors for any brand color, and page layout are automatic. Write standard HTML elements and ARIA attributes; do not invent class names.

Add this to `<head>`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tagbrush@1/tagbrush.min.css">
```

This file lists every pattern in one line. Each group links to a detail file with full examples and what each pattern leaves alone; read the one for what you're building. Everything in one file: [llms-full.txt](https://kovirlabs.github.io/tagbrush/llms-full.txt).

## Rules for writing pages

- Use semantic elements instead of classes or `<div>` wrappers. Styling comes from the element, not from classes.
- Do not add utility classes (Tailwind, Bootstrap) or inline layout styles. They are not needed.
- Do not write CSS for layout, spacing, colors, or dark mode unless asked. Theme with the variables below if a brand color or font is requested.
- Use `<header>`, `<main>`, and `<footer>` as direct children of `<body>`.
- Before writing CSS for something, check this list: most common page parts already come from plain HTML.

## Pages and landing pages

Details: [references/pages.md](references/pages.md)

- **Page landmarks**: `<header>`, `<main>`, `<footer>` in `<body>` are centered, with the footer at the bottom.
- **Reading width**: a `<main>` with one `<article>` (a post, a docs page) is 70 characters wide.
- **Skip link**: `<a href="#main">Skip to content</a>` first in `<body>` shows only when focused.
- **Your own layout**: `<body data-layout="full">` turns the page layout off.
- **Top bar**: `<header><nav><strong>Site</strong><ul><li><a href="/" aria-current="page">Home</a></li></ul></nav></header>`.
- **Phone menu**: `<nav><strong>Site</strong><button popovertarget="menu" aria-label="Menu">☰</button><div popover id="menu"><ul>…</ul></div></nav>`: links in the bar on wide screens, behind the button on phones.
- **Dropdown menu**: `<li><details><summary>Services</summary><ul>…</ul></details></li>` in the header nav.
- **User menu**: a header-nav button with `popovertarget` opening `<div popover><nav><ul>…</ul></nav></div>`.
- **Pagination**: `<nav aria-label="Pagination">` with `rel="prev"` and `rel="next"` links.
- **Breadcrumbs**: `<nav aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a aria-current="page">Page</a></li></ol></nav>`.
- **Footer columns**: a page `<footer>` with two or more `<nav>`s (a heading and a list each).
- **Hero**: `<hgroup><h1>…</h1><p>…</p></hgroup>` after the nav in the page header, then `<div role="group">` of buttons.
- **Hero picture**: a `<figure>` or `<img>` after the hero's buttons sits beside the text.
- **Photo hero**: an `<img>` first in the page header, before the `<nav>`, fills it under a dark wash.
- **Full-width bands**: `<main data-layout="full">`: each `<section>` spans the page; `<section data-theme="dark">` is a dark band.
- **Label above a heading**: `<hgroup><p>Pricing</p><h2>Simple plans</h2></hgroup>`.
- **Steps**: `<ol><li><h3>Plan</h3><p>…</p></li></ol>`: items starting with a heading make a numbered timeline.
- **Picture beside text**: `<section><figure><img src="…" alt="…"></figure><div>…</div></section>`.
- **Logos**: a `<ul>` of only `<img>`s in a section is a centered row.
- **Single-form page**: `<main><article><form>…</form></article></main>` is a narrow column.
- **Card grid**: `<section><h2>…</h2><article>…</article><article>…</article></section>`.
- **Card icon**: an `<svg>` without width/height first in a card sits on a tinted tile.
- **Card picture**: an `<img>` first in a card runs to its edges.
- **Card buttons**: a last paragraph of buttons in a card sits at the bottom.
- **Clickable card**: a card whose heading holds its only link is clickable all over.
- **Featured card**: the one card with a solid `class="button"` while the rest use `class="button outline"`.
- **Testimonial**: `<article><blockquote>…</blockquote><footer>Name</footer></article>` in a card grid.
- **Post list**: `<ul><li><article>…</article></li></ul>` is a card grid.

## Apps, dashboards, and docs

Details: [references/apps.md](references/apps.md)

- **Sidebar layout**: an `<aside>` with a `<nav>` next to `<main>` is a sidebar; before the `<header>`, full height.
- **Docs contents**: `<main><aside><nav>…</nav></aside><article>…</article></main>` keeps the contents in view.
- **Title with actions**: `<header><h1>Users</h1><button>Invite user</button></header>` in `<main>` is one row.
- **Search and filters**: `<search><input type="search" aria-label="Search"><button>Filter</button></search>` is a row.
- **Stat tiles**: `<dl><div><dt>Revenue</dt><dd>$84,312</dd></div></dl>`.
- **Status badges**: `<mark data-tone="success">Paid</mark>` (also `warning`, `error`, `info`, `neutral`).
- **Changes**: `<ins>+12%</ins>` and `<del>−3%</del>`.
- **Progress and meter**: `<progress value="40" max="100">` and `<meter value="0.7" low="0.5" high="0.8">`.
- **Loading**: `aria-busy="true"` shows a spinner.
- **Modal**: `<dialog><form method="dialog"><header><h2>…</h2><button aria-label="Close">✕</button></header>…<footer><button>OK</button></footer></form></dialog>`.
- **Tabs**: `<div role="tablist">` of `<button role="tab" aria-controls="…">` and `role="tabpanel"` sections; TagAction switches them.
- **Popover**: `<button popovertarget="tip">?</button><div popover id="tip">…</div>`.
- **Buttons**: `<button>`, `class="secondary"`, `class="outline"`, and `<a class="button" href="…">`.
- **Button row**: `<div role="group">` around buttons, or an input and a button.
- **Icons**: an `<svg viewBox="0 0 24 24" aria-hidden="true">` without width/height in a button, link, or heading is sized to the text.

## Forms

Details: [references/forms.md](references/forms.md)

- **Fields**: `<label for="email">Email</label><input type="email" id="email">`, or the input inside its label.
- **Help text**: a `<small>` right after the field.
- **Errors**: `aria-invalid="true"`; native validation shows after the user interacts.
- **Valid fields**: fields with `required`, `pattern` or `type="email"` turn green once met.
- **Checkboxes and radios**: `<label><input type="checkbox"> Text</label>`.
- **Choice cards**: `<label><input type="radio" name="plan"> <strong>Team</strong> <small>Up to 10 people</small></label>`.
- **Toggle switch**: `<label><input type="checkbox" role="switch"> Label</label>`.
- **Select**: `<select>` is themed, with a themed picker for mouse users where supported.
- **Text areas**: a `<textarea>` without `rows` grows as the user types.
- **Field groups**: `<fieldset><legend>Title</legend>…</fieldset>`.
- **Form buttons**: `<button>` submits; `aria-busy="true"` while sending.

## Content

Details: [references/content.md](references/content.md)

- **Headings and subtitles**: `<hgroup><h1>Title</h1><p>Subtitle</p></hgroup>`.
- **Inline text**: `<mark>`, `<kbd>`, `<code>`, `<abbr title="…">`, `<del>`, `<ins>`, `<small>`; `<s>` for an old price.
- **Callouts**: `<aside>` inside an `<article>`, starting with a bold word; `data-tone` colors it.
- **Quotes**: `<blockquote><p>…</p><footer>Author</footer></blockquote>`.
- **Pull quote**: `<figure><blockquote>…</blockquote><figcaption>Name</figcaption></figure>`.
- **Avatars**: an `<img>` in a figcaption, an article footer, or an `<address>` is round.
- **Addresses**: `<address>` for contact details.
- **Document links**: links to `.pdf`, `.docx`, `.xlsx`, `.csv`, `.zip` get a label; `download` links an arrow.
- **Images**: `<figure><img src="…" alt="…"><figcaption>Caption</figcaption></figure>`.
- **Video embeds**: an `<iframe>` without a height is 16:9.
- **Tables**: `<table>` with `<thead>`/`<tbody>`; wide ones scroll; `<figure>` around one fills the width; `class="striped"`.
- **Numbers in tables**: a `<data>` value alone in a cell aligns right.
- **Code**: `<pre><code>`; common highlighters' classes are colored.
- **Accordion**: neighboring `<details>` with the same `name` join into one.
- **Motion**: dialogs, popovers, and page changes animate on their own.

## Chat and AI output

Details: [references/chat.md](references/chat.md)

- **Chat messages**: each message in `<div class="tagbrush" data-density="compact">` with the scoped build, `tagbrush.scoped.min.css`.
- **Transcripts**: a whole conversation page: the full stylesheet and `data-density="compact"` on `<html>`.
- **Compact density**: `data-density="compact"` tightens spacing on any element.
- **Reasoning**: `<details data-reasoning><summary>Thought for 4 seconds</summary>…</details>`.
- **Citations**: `<sup><a href="#source-1">1</a></sup>` and a sources list at the end.
- **Alerts**: GitHub alerts and MkDocs admonitions are colored callouts.
- **Narrow columns**: wide tables, code, and math scroll sideways.

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
  --hero-background: none;           /* turns off the hero tint */
  --color-background: light-dark(#fffdf7, #14110f);
}
```

To force light or dark: `<html data-theme="light">` or `data-theme="dark"` on any element.

## Checking your work

Add `data-tagbrush="debug"` to `<html>` while working, then look at the page (or a screenshot). Red dashed outlines mark images without `alt`, form fields without a label, buttons or links without text, and clickable `<div>`/`<span>` elements; amber dotted outlines mark classes TagBrush.css doesn't use and inline styles that aren't CSS variables. Fix them, then remove the attribute.

Without screenshots, run `npx tagbrush check page.html` (files or folders). It reports the same problems as text, plus a missing `lang` or viewport, `<label for>` values with no matching `id`, skipped heading levels, duplicate ids, and CSS in `<style>` blocks other than variables. Exit code 1 means errors to fix.

## Links

- [The Tag family](https://kovirlabs.github.io/tagstack/llms.txt): how TagBrush.css, TagAction, and TagCheck fit together
- [README](https://github.com/kovirlabs/tagbrush#readme): full documentation and the list of variables
- [Live demo and theme builder](https://kovirlabs.github.io/tagbrush/)
- [starter.html](https://github.com/kovirlabs/tagbrush/blob/main/starter.html): a complete example page
