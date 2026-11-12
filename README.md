<h1 align="center"><code>&lt;tagbrush&gt;</code></h1>

<p align="center"><strong>TagBrush.css</strong></p>

**Make plain HTML look finished. One `<link>`, no classes.**

You know HTML and want a page that looks good now: a landing page, docs, a blog, a Markdown export, an internal tool. Add one stylesheet and write ordinary HTML. The page is laid out, the forms and tables are styled, dark mode follows the system, and any brand color you pick stays readable. No classes to learn, no build step, no JavaScript, about 8.5 KB gzipped.

When you do want to customize, a few CSS variables re-theme everything, and any CSS you write wins without `!important`. The same file works in plain HTML, static site generators, and every major framework.

👉 **See it in action:** [kovirlabs.github.io/tagbrush](https://kovirlabs.github.io/tagbrush/) has a live demo of every styled element, plus a theme builder that writes your custom CSS for you.

---

## Quick start

Add one line to your `<head>`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tagbrush@2/tagbrush.min.css">
```

Then write ordinary HTML:

```html
<header><nav><strong>My site</strong> <a href="/about">About</a></nav></header>
<main>
  <h1>Hello, world</h1>
  <p>It already looks good.</p>
  <button>Click me</button>
</main>
<footer>© 2026 Me</footer>
```

The content is centered and the footer stays at the bottom of the window, with no classes. See [Page layout](#page-layout).

**Starting from scratch?** Copy [`starter.html`](starter.html), a complete page with navigation, cards, a form, and a footer, and edit from there.

**Using a site generator?** The [starters](starters/) give you a working Hugo, Eleventy, or Astro blog in one command, and a [Pandoc template](starters/pandoc/) turns any Markdown file into a styled page.

**Having an AI assistant write the page?** See [Pages written by AI](#pages-written-by-ai).

**Converting Markdown?** Add the `<link>` to the page template of your static site generator, or to the HTML that Pandoc, markdown-it, or marked outputs. Headings, code blocks, task lists, tables (including column alignment), and footnotes are all styled, and wide tables scroll instead of widening the page.

### Versioning

The `@2` in the URL gets fixes and new features, but never breaking changes. To lock to one exact release, use the full version, for example `tagbrush@2.0.0`.

### Install with npm

```sh
npm install tagbrush
```

```js
import 'tagbrush';              // tagbrush.css
import 'tagbrush/min';          // minified
import 'tagbrush/scoped';       // only styles inside .tagbrush (see below)
import 'tagbrush/shadow';       // for use inside a shadow root (Web Components)
```

Or just [download `tagbrush.css`](tagbrush.css) and host it yourself.

## Features

- **Classless page layout** – `header`, `main`, and `footer` center themselves with full-width backgrounds, and the footer stays at the bottom of short pages. Markdown output without a `<main>` is centered too.
- **Classless everything else** – typography, lists, media, forms, tables, dialogs, and more are styled automatically. Common components come from the HTML and ARIA you'd write anyway: `role="switch"` makes a toggle, `aria-busy="true"` shows a spinner, `<nav aria-label="Breadcrumb">` gets separators.
- **Markdown-ready** – task lists, footnotes, column alignment, and wide tables from GitHub-flavored Markdown, Pandoc, markdown-it, and Hugo all look right.
- **One color, a whole palette** – pick any `--color-primary` and the backgrounds, surfaces, and borders take on a hint of it, button text switches between white and black, and links darken or lighten as needed to stay readable. The tests check WCAG AA contrast for 10 different primary colors in light and dark mode.
- **Dark mode** – follows the system setting automatically, or force it per page or per element with `data-theme`.
- **Easy to override** – everything lives in a `@layer`, so any CSS you write wins without `!important`.
- **Themeable** – colors, fonts, type scale, spacing, and radius are semantic CSS variables, and one variable re-themes everything. The [theme builder](https://kovirlabs.github.io/tagbrush/#theming) writes the CSS for you.
- **Accessible** – WCAG AA contrast (darker borders and full-contrast muted text under `prefers-contrast: more`), scrollbars in the theme's colors, visible keyboard focus rings, `prefers-reduced-motion`, forced-colors support, and print styles.
- **Small helpers when you want them** – `.grid`, `.card`, `.container`, and `role="group"` cover the layouts most sites need.
- **No build step, no dependencies** – plain CSS you can link, copy, or import. About 9 KB minified and gzipped.
- **Works with any framework** – import it once in your root layout. [Setup guides](frameworks/README.md) cover Astro, Next.js, React, Vue, Nuxt, Angular, SvelteKit, Solid, Web Components, and Tailwind.

## How it compares

TagBrush.css sits in a family of drop-in stylesheets for semantic HTML. [Pico CSS](https://picocss.com/docs/maintenance) was the best known, but it's no longer maintained (2.1.1 is its final release); [Blades CSS](https://blades.dev) is its maintained, drop-in fork. [Oat](https://oat.ink) is a newer semantic library that adds JavaScript components, and [Simple.css](https://simplecss.org) and [Water.css](https://watercss.kognise.dev) are the smallest. Measured from each package's current npm release in November 2026 (Blades 3.1.1, Oat 1.1.0, Simple.css 2.3.7, Water.css 2.1.1):

| | TagBrush.css | Blades CSS (Pico fork) | Oat | Simple.css | Water.css |
|---|---|---|---|---|---|
| Size (minified, gzipped) | 8.5 KB | 12.1 KB | 7.1 KB CSS + 4.0 KB JS | 2.7 KB | 3.5 KB |
| Actively maintained | Yes | Yes | Yes | Yes | No commits since early 2024 |
| JavaScript needed | No | No | For tabs, dropdowns, and toasts | No | No |
| Your CSS wins without `!important` (`@layer`) | Yes | No | Yes | No | No |
| Dark mode from the system setting | Yes | Yes | Yes | Yes | Yes |
| Force light or dark on any element | Yes (`data-theme`) | Yes (`data-theme`) | No | No | Separate light and dark files |
| Readable button text for any accent color | Automatic | Set by hand (`--pico-primary-inverse`) | Set by hand (`--primary-foreground`) | Set by hand (`--accent-text`) | Set by hand |
| Page layout with no classes | Centered landmarks, sidebar layouts, article grids, sticky footer | Centered `main` | Sidebar with `data-sidebar` | Centered column | Centered body |
| Markdown output (task lists, footnotes, highlighted code) | Yes | No | No | No | No |
| Style only part of a page | Yes (`@scope`, `class="tagbrush"`) | Yes (`class="pico"` builds) | No | No | No |
| Inside Web Components (Shadow DOM) | Yes (shadow build) | Yes | No | No | No |
| Built for AI agents (`llms.txt`, agent files, page checker) | Yes | No | No | No | No |

**Choose Simple.css or Water.css** if the smallest possible file matters most. **Choose Blades** if you have a Pico site to keep running. **Choose Oat** if you want ready-made interactive components like tabs and toasts and don't mind a little JavaScript. **Choose TagBrush.css** if you want plain HTML and Markdown to look finished without classes or JavaScript, need your own CSS to win cleanly, want any brand color to stay readable, or have AI agents writing your pages. In our [benchmarks](evals/benchmark-2/), agents using TagBrush.css produced the same designs as with Tailwind or hand-written CSS with about 35% less output, and plain pages with 5–8× less.

## What gets styled

| Category   | Elements                                                                 |
|------------|--------------------------------------------------------------------------|
| Typography | `h1`–`h6`, `hgroup` (muted subtitle; a `<p>` before the heading is a muted label), `p`, `a`, `strong`, `small`, `mark`, `abbr`, `del`, `ins`, `s`, `dfn`, `q`, `sub`, `sup`, `hr`, `address`, `blockquote` (with `footer` attribution; in a `figure` with a `figcaption`, a pull quote), `code`, `pre`, `kbd`, `samp`, `output` |
| Lists      | `ul`, `ol`, `menu` (including nested lists, muted `::marker`), Markdown task lists (checkbox replaces the bullet), `dl`, `dt`, `dd`. An `<ol>` whose items start with a heading is a numbered timeline of steps; a `<ul>` of only images in a section, header, or footer is a centered row of logos |
| Media      | an `iframe` without a `height` (16:9, full width), a small `img` in a `figcaption`, article `footer` or `address` (round avatar), `img`, `picture`, `video`, `audio`, `canvas`, `svg`, `iframe`, `object`, `embed` (scale to fit), `figure`, `figcaption`. Inline SVG icons without `width`/`height` in buttons, links, headings, labels, list items, and badges are sized to the text |
| Code highlighting | Token colors for Prism, highlight.js, Hugo (Chroma), Jekyll (Rouge), Pandoc, and Pygments output, and Shiki's dual themes and `css-variables` theme. Follows the theme and dark mode; a highlighter theme you load yourself still wins |
| Markdown   | Footnotes from GitHub-flavored Markdown, markdown-it, and Pandoc (smaller, muted, highlighted when linked to); long URLs and words wrap instead of widening the page |
| Article grids | A `<section>` of two or more `<article>`s, or a `<ul>` of `<li><article>`s, becomes a responsive grid of cards; a card with a link, button, or picture is a filled box and a card of only text is open; an icon `<svg>` first in a card is a plain icon at heading size, a `<strong>` price with a `<small>` period is a large figure, an `<img>` first runs to the card's edges, a last footer or paragraph of buttons sits at the bottom so buttons line up, a card whose heading holds its only link is clickable all over, a `<blockquote>` in a card is a testimonial, and the one card in a row with a solid button (the rest outlined) is featured |
| Status badges | `<p role="status">` and `<p role="alert">` (or a `div`, `section`, `aside`) are info and error banners, recolored by `data-tone`; `<mark data-tone="success">` (also `warning`, `error`, `info`, `neutral`, or any color with `style="--tone: …"`) is a tinted pill that stays readable in both schemes; `data-tone` on an `article aside` colors the callout |
| App patterns | `<aside>` next to `<main>` is a sidebar layout (vertical navigation, stacks on phones), full height when the `<aside>` comes before the `<header>`; `<aside>` next to an `<article>` in `<main>` is a sticky table of contents; a `<dl>` of `<div>`s is stat tiles; a `<header>` with a heading and buttons is one row; `<search>` lays out filters; an `<hgroup>` in the page header is a hero, with a `<figure>` or image beside it if you add one, or a photo behind it when an `<img>` comes first in the header; a `<section>` of just a `<figure>` and a `<div>` puts them side by side; a page `<footer>` with two or more `<nav>`s is a site map in columns |
| Structure  | `<header data-layout="sticky">` (a top bar that stays, with room kept above jumped-to headings), `nav` (with `ul`/`menu` rendered as a horizontal menu, `aria-current` highlighted; links in a `[popover]` in the header nav become a phone menu behind its `popovertarget` button), a skip link (`<a href="#main">` first in `<body>`, shown on focus), `header`, `main`, `footer`, `search`, `article aside` (callout), breadcrumbs (`<nav aria-label="Breadcrumb">` gets `/` separators) |
| Buttons    | `button`, `input[type=submit/button/reset]`, `.button`, `:disabled`, `aria-disabled`; a chevron on `button[aria-expanded]` that flips when open; `aria-pressed="true"` looks held down; `data-tone="error"` (or any tone) colors a button, solid or `.outline`, for destructive actions |
| Loading    | `aria-busy="true"` on a button or any element shows a spinner |
| Forms      | `fieldset`, `legend`, `label` (including inputs wrapped in their label), `textarea` (grows as you type unless it has a `rows` attribute), `select` (consistent arrow in the theme's colors; with a mouse, a themed picker where `appearance: base-select` is supported), `select[multiple]`, `optgroup`, every text-like `input` type (including `date`, `time`, `search`, …), `checkbox`, `radio`, toggle switches (`<input type="checkbox" role="switch">`), `range`, `color`, `file`, `image` |
| Form states | a red asterisk on the label of a `required` field in a form that also has optional fields, `:focus`, `:disabled`, `readonly`, `::placeholder`, `aria-invalid="true"` / `"false"`, `:user-invalid`, `:user-valid` on fields with a rule (`required`, `pattern`, `type="email"`, …), a radio or checkbox label with a `<small>` description as a choice card, help text via `<small>` after a field. Fields are spaced automatically. |
| Links      | A link in text with `target="_blank"` ends in ↗ ("opens in a new tab" for screen readers); links to `.pdf`, `.doc(x)`, `.xls(x)`, `.csv` and `.zip` files get a small label saying so; `download` links get an arrow. Buttons and nav links are left alone |
| Tables     | `table`, `caption`, `<data>` values in cells (right-aligned, tabular figures), rows highlighted under the pointer, a row tinted when the checkbox in its first cell is checked, `thead`, `tbody`, `tfoot`, `th`, `td`, and the `align` attribute. A table is as wide as its content and scrolls sideways inside itself when it doesn't fit. Wrap it in `<figure>` to make it fill the full width instead. Wide tables and code blocks show a shadow at an edge with more to scroll to |
| Interactive | tabs (`role="tablist"`, `role="tab"`, `role="tabpanel"`; TagAction switches the panels), `details`, `summary` (a chevron marker, at the end in an accordion; opening eases where the browser can animate height; neighboring `details` join into an accordion; a `details` in a header nav list is a dropdown menu), `dialog` (with `::backdrop`; the page behind a modal doesn't scroll or shift; a `header` with a close button and a `footer` of right-aligned buttons), `[popover]` (dialogs and popovers fade in and out), `progress`, `meter` (green / amber / red from its `low`, `high`, and `optimum` attributes) |

### Utility classes

TagBrush.css keeps classes to a minimum:

| Class        | What it does                                                        |
|--------------|---------------------------------------------------------------------|
| `.container` | Centers content with a max width (`--container-max-width`) and horizontal padding. Optional: [page layout](#page-layout) already centers `header`, `main`, and `footer` |
| `.button`    | Gives any element (usually an `<a>`) the button style               |
| `.secondary` | Neutral button variant (also applied to `type="reset"` buttons)     |
| `.outline`   | Transparent button with a primary-colored border                    |
| `.grid`      | Responsive columns that wrap to one column on small screens. Tune with `--grid-min-column` and `--grid-gap`, globally or on one grid |
| `.card`      | Boxed content with padding, border, and surface background         |
| `role="group"` | Lays out buttons in a row. Put an input and a button inside for an inline form (e.g. a search bar) |
| `.striped`   | Zebra-striped table rows                                            |
| `.visually-hidden` | Hides content visually but keeps it available to screen readers |

## Pages written by AI

AI assistants are good at semantic HTML, and a classless stylesheet gives them no class names to get wrong. Ask for plain HTML with TagBrush.css and the page looks finished without any CSS from the assistant:

```text
Build a page for <what you need> as a single HTML file. Use semantic HTML
with no classes and no custom CSS, styled by TagBrush.css. Follow
https://kovirlabs.github.io/tagbrush/llms.txt
```

[`llms.txt`](llms.txt) is an index written for AI assistants: the rules, and every pattern in one line (the HTML to write and what it becomes), grouped by what you're building. Each group links to a detail file in [`llms/`](llms/) with full examples and what each pattern leaves alone, so an assistant reads the one it needs. [`llms-full.txt`](llms-full.txt) has everything in one file. Assistants that can read links will follow them.

For coding agents, install it once and the agent follows it automatically. One command adds a [Claude Code skill, a Cursor rule, or an `AGENTS.md` section](ai/):

```sh
npx degit kovirlabs/tagbrush/ai/claude/tagbrush .claude/skills/tagbrush
```

The tests render every snippet in the guide, check that every pattern in a detail file is named in the index (so an agent always knows it exists), and keep the index under 4,000 tokens.

### Chat apps and AI output

Chat interfaces render a model's Markdown as HTML. Load the scoped build and wrap each message, so only messages are styled and the rest of the app is untouched:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tagbrush@2/tagbrush.scoped.min.css">

<div class="tagbrush" data-density="compact">
  <!-- the rendered Markdown of one message -->
</div>
```

With [marked](https://marked.js.org/) or [markdown-it](https://github.com/markdown-it/markdown-it), that's `message.innerHTML = marked.parse(text)` on that element (sanitize model output first, for example with DOMPurify, as with any HTML you didn't write). In React, render the same element with the HTML inside it. Inside a Web Component, use `tagbrush.shadow.css` and put `data-density="compact"` on the host element.

- **`data-density="compact"`** tightens spacing and shrinks headings for a chat column. While a reply streams in, the message's last element adds no space below it and a code block that has just opened already has a line's height, so the message doesn't jump.
- **Reasoning:** `<details data-reasoning><summary>Thought for 4 seconds</summary>…</details>` is a muted, collapsible block. Open WebUI's `<details type="reasoning">` works too.
- **Citations:** `<sup><a href="#source-1">1</a></sup>` is a small chip; put the sources in a `<footer>` with an `<ol>` at the end of the answer.
- **Callouts** from GitHub alerts (`> [!NOTE]`, `[!TIP]`, `[!WARNING]`, `[!CAUTION]`) and Python-Markdown/MkDocs admonitions are styled and colored by kind.
- **Math:** KaTeX and MathJax block math scroll sideways in a narrow column (they still need their own stylesheets for the formulas themselves). Block MathML scrolls in Chromium; Firefox and Safari don't scroll a `<math>` element yet, so prefer KaTeX or MathJax output for long formulas.

### Debug mode

Add `data-tagbrush="debug"` to `<html>` (or any element) to outline common mistakes, for you or for an agent that takes screenshots:

- **Red dashed:** images without `alt`, form fields without a label, buttons and links without text, clickable `<div>`/`<span>`, a second `<main>`.
- **Amber dotted:** classes TagBrush.css doesn't use, and inline styles other than CSS variables.

A small legend appears in the corner. Remove the attribute when you're done; nothing changes without it.

### Checking pages from the command line

```sh
npx tagbrush check index.html          # files or folders
npx tagbrush check site/ --json        # for scripts and agents
```

It reports the same problems as debug mode, plus page-level ones that CSS can't see: a missing `lang` or viewport tag, a `<label for>` with no matching `id`, skipped heading levels, duplicate ids, and layout CSS in `<style>` blocks. Errors exit with code 1 (`--strict` fails on warnings too), so it works in CI and as a final step for coding agents. It has no dependencies.

## Page layout

Write the usual page landmarks and TagBrush.css lays them out:

```html
<body>
  <header>…</header>
  <main>…</main>
  <footer>…</footer>
</body>
```

- `header`, `main`, and `footer` stretch across the window, so a background color on them reaches the edges, while their content stays centered within `--container-max-width` (1200px) with `--container-padding` on the sides.
- On short pages the footer sits at the bottom of the window.
- A page without `<main>`, such as plain Markdown output, is centered at a comfortable reading width (`--reading-width`, 70 characters), and so is a `<main>` holding a single `<article>`, like a blog post or docs page. Pages with more varied content use the wider `--container-max-width`.
- A `<section>` of two or more `<article>`s lays them out as a responsive grid of cards. Headings and paragraphs in the section span the full width above them.
- A wrapper element without a class around the landmarks counts as the page too, so framework wrappers like `<div id="root">`, `<div id="__nuxt">`, and Angular's `<app-root>` work without changes.
- An `<hgroup>` in the page `<header>` is a hero (`--hero-background` puts a wash behind it; none by default). Add a `<figure>`, `<img>`, or `<svg>` after it to put a picture beside the text. An `<img>` first in the header, before the `<nav>`, is a photo behind the hero instead, under a dark wash that keeps the text readable.
- An `<aside>` next to `<main>` is a sidebar. Put it before the `<header>` and it runs the full height of the window, with the header as a top bar beside it.
- A page `<footer>` with two or more `<nav>`s lays them out as columns of links; a last paragraph (the copyright line) spans the width below them.
- Links in a `<div popover>` inside the header's `<nav>` are a phone menu: they sit in the bar on wide screens, and on phones the `<button popovertarget>` before them opens them as a panel. No JavaScript.
- A link to an id first in `<body>` (`<a href="#main">Skip to content</a>`) is a skip link, out of sight until it's focused.
- Pages of the same site cross-fade into each other as you navigate (`@view-transition`), unless the reader prefers reduced motion. To turn it off, add `@view-transition { navigation: none; }` to your CSS.
- On touch screens, header links are at least 44px tall.
- Pages that already use `.container` look exactly as before.

To lay out the page yourself, add `data-layout="full"` to `<body>` (or to the wrapper). To let just one landmark go edge to edge, for example a full-width hero, put it on that element: `<header data-layout="full">`. On `<main data-layout="full">`, each `<section>` (and a `<header>`) inside becomes a full-width band whose content is centered in the page column, so landing pages can give a band its own background, such as `<section data-theme="dark">`. Giving the wrapper element a class also tells TagBrush.css it's your own layout.

The scoped and Shadow DOM builds leave page layout out, because they style part of a page that something else lays out.

## Customization

All design tokens live on `:root`. Override any of them in your own CSS:

```css
:root {
  --color-primary: #10b981;       /* emerald */
  --font-family-base: "Inter", sans-serif;
  --border-radius: 0.5rem;
}
```

Hover colors, focus rings, button text, and link colors are derived from `--color-primary` automatically, and they stay readable whatever color you pick: buttons switch between white and black text, and links are darkened or lightened as needed. Set `--color-on-primary`, `--color-link`, `--color-primary-hover`, or `--focus-ring-color` only if you want something different.

> **Shortcut:** the [theme builder](https://kovirlabs.github.io/tagbrush/#theming) shows the contrast of your colors as you pick them, and its address bar always holds a link you can share.

> **Shortcut:** the theme builder on the [demo page](index.html) lets you pick colors, fonts, radius, and spacing visually, then copy the CSS.

### Common recipes

```css
:root {
  --font-family-heading: Georgia, serif;   /* different font for headings */
  --color-link: #7c3aed;                  /* links in a different color from buttons */
  --spacing: 1.25rem;                     /* scale every margin and padding at once */
  --button-radius: 999px;                 /* pill buttons, inputs unchanged */
  --input-radius: 0;                      /* square inputs, buttons unchanged */
  --card-padding: 2rem;                   /* roomier cards */
}
```

Variables can also be set on any element to theme just that part of the page, for example `<section style="--color-primary: #e11d48">`.

### Your CSS always wins

TagBrush.css wraps everything in a cascade layer called `tagbrush`. CSS outside a layer always beats CSS inside one, whatever the specificity, so overriding is as simple as:

```css
button { border-radius: 999px; }   /* beats TagBrush.css, no !important needed */
```

Load order doesn't matter either. If you organize your own CSS into layers, declare the order once:

```css
@layer tagbrush, components, utilities;
```

### Dark mode

TagBrush.css follows the visitor's system setting out of the box. To force a scheme, set `data-theme` on `<html>` or on any element to theme just that part of the page:

```html
<html data-theme="dark">                  <!-- whole page -->
<section data-theme="light">…</section>   <!-- just this section -->
```

To turn dark mode off entirely: `:root { color-scheme: light; }`.

Color variables use [`light-dark()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark) so each carries both values. **When you override a color, give it both values too**, or one of the schemes will look wrong:

```css
:root {
  --color-background: light-dark(#fafaf9, #0c0a09);
  --color-text: light-dark(#1c1917, #e7e5e4);
}
```

### Custom button variants

Button variants only change a few private variables, so you can add your own in one line:

```css
.danger { --_btn-bg: var(--color-error); --_btn-bg-hover: color-mix(in srgb, var(--color-error), black 15%); }
```

`--_btn-bg`, `--_btn-bg-hover`, `--_btn-color`, and `--_btn-border` are available.

### Available variables

| Variable                | Default      | Used for                                  |
|-------------------------|--------------|-------------------------------------------|
| `--color-primary`       | `#2563eb`    | Links, buttons, focus rings, checkboxes, progress bars |
| `--color-on-primary`    | *derived*    | Text on primary buttons: white or black, whichever is more readable on `--color-primary` |
| `--color-primary-hover` | *derived*    | Button hover (primary, darker under white text and lighter under black text) |
| `--color-link`          | *derived*    | Link and outline-button text (primary, darkened in light mode and lightened in dark mode as far as needed to stay readable) |
| `--color-link-hover`    | *derived*    | Link hover (link color, darkened in light mode, lightened in dark mode) |
| `--color-background`    | white / near-black, *tinted* | Page, input, and dialog backgrounds  |
| `--color-surface`       | light / dark gray, *tinted* | Code, blockquotes, cards, secondary buttons |
| `--color-text`          | near-black / near-white, *tinted* | Body text                       |
| `--color-heading`       | `--color-text` | Headings                                |
| `--color-text-muted`    | mid gray, *tinted* | Captions, help text, placeholders, footers |
| `--color-border`        | light / dark gray, *tinted* | Inputs, tables, rules, details  |
| `--color-highlight`     | `#fef08a` / `#713f12` | `<mark>` background             |
| `--color-error`         | `#dc2626` / `#f87171` | Invalid fields and their help text |
| `--color-success`       | `#16a34a` / `#4ade80` | Fields marked `aria-invalid="false"`, good `meter` values, `<ins>` |
| `--color-warning`       | `#d97706` / `#fbbf24` | Middling `meter` values, `data-tone="warning"` |
| `--color-marker`        | *derived*    | List bullets and numbers, `summary` arrows (defaults to muted text) |
| `--focus-ring-color`    | *derived*    | Focus outlines (primary at 50% opacity)   |
| `--focus-ring-width`    | `3px`        | Focus outlines and input focus rings      |
| `--font-family-base`    | system stack | All text                                  |
| `--font-family-mono`    | system mono  | `code`, `pre`, `kbd`, `samp`              |
| `--font-family-heading` | `--font-family-base` | Headings                          |
| `--font-size-base`      | `1rem`       | Body text, buttons, inputs                |
| `--font-size-sm`        | `0.875rem`   | `small`, captions, footers                |
| `--font-size-h1` … `--font-size-h6` | `1.875rem`–`2.5rem` (grows with the screen) – `1rem` | Heading sizes |
| `--font-weight-heading` | `600`        | Headings                                  |
| `--line-height` / `--line-height-heading` | `1.6` / `1.2` | Body text / headings |
| `--spacing`             | `1rem`       | Base unit; `--spacing-xs` … `--spacing-xl` are 0.25× – 2× of it |
| `--spacing-xs` … `--spacing-xl` | `0.25rem` – `2rem` | Margins and padding throughout |
| `--grid-min-column` / `--grid-gap` | `16rem` / `1.5rem` | Column width before wrapping, and gap, for `.grid` and article grids |
| `--container-max-width` | `1200px`     | Page width, and `.container` width        |
| `--reading-width`       | `70ch`       | Line length for text pages (no `<main>`, or `<main>` with one `<article>`) |
| `--container-padding`   | `1rem`       | `.container` side padding                 |
| `--border-radius`       | `0.375rem`   | Buttons, inputs, code, dialogs            |
| `--border-width`        | `1px`        | Inputs, buttons, table rules              |
| `--code-comment`, `--code-keyword`, `--code-string`, `--code-function`, `--code-constant`, `--code-tag` | muted text, then violet, green, blue, amber, rose | Syntax highlighting colors, each with a light and a dark value |
| `--shadow` / `--shadow-lg` | soft shadows | Available for your components / dialogs; hero images |
| `--hero-background` | `none` | Background of the page-header hero, for example a gradient |
| `--tone` | *from `data-tone`* | Color of a badge (`<mark>`), callout, or card icon; set it inline for any color |
| `--transition-duration` | `0.15s`      | Hover and focus transitions (`0s` with reduced motion) |
| `--button-padding` / `--button-radius` / `--button-font-weight` | spacing, radius, `500` | Buttons and file-picker buttons |
| `--input-padding` / `--input-radius` | spacing, radius | Text inputs, selects, textareas |
| `--card-padding` / `--card-radius` | `1.5rem` / radius | `.card`                       |

Where two defaults are shown, they are the light and dark values. *Tinted* neutrals carry a trace of `--color-primary`'s hue (chroma at most 0.012, grays and black not at all), so they stay near-neutral and the brand color shows only where it means something. Set any of them to a plain color to opt out, for example `--color-surface: light-dark(#f4f4f5, #27272a)`.

### Browser support

TagBrush.css uses modern CSS (`@layer`, `light-dark()`, `color-mix()`, `:has()`, `:where()`), supported by all evergreen browsers since 2024. It's tested in Chromium, Firefox, and WebKit on every pull request.

## Adding TagBrush.css to an existing site

`tagbrush.css` styles the whole page. To use it inside part of an existing site (a docs section, a CMS block, a widget) without touching anything else, use the scoped build and wrap that part in `class="tagbrush"`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tagbrush@2/tagbrush.scoped.min.css">

<div class="tagbrush">
  <h2>Only this part is styled by TagBrush.css</h2>
</div>
```

Customize it on the wrapper: `.tagbrush { --color-primary: #10b981; }`. The scoped build doesn't include [page layout](#page-layout), since the host site already lays out the page.

The scoped build uses [`@scope`](https://developer.mozilla.org/en-US/docs/Web/CSS/@scope), which is newer than the rest of the library ([check support](https://caniuse.com/css-cascade-scope)). The host site's own global styles (for example a site-wide `button { … }` rule) still apply inside the wrapper, because unlayered CSS always wins.

## Using with a framework

TagBrush.css is plain CSS, so the same file works everywhere. Import it once in your root layout or entry file:

```js
import 'tagbrush';
```

Your component styles (Astro, Vue `scoped`, Svelte, CSS Modules, Angular) are unlayered, so they always override it.

Step-by-step guides with copy-paste snippets:

| | | |
|---|---|---|
| [Astro](frameworks/astro/README.md) | [Next.js](frameworks/nextjs/README.md) | [React (Vite, Gatsby)](frameworks/react/README.md) |
| [React Router / Remix](frameworks/react-router/README.md) | [Vue](frameworks/vue/README.md) | [Nuxt](frameworks/nuxt/README.md) |
| [Angular](frameworks/angular/README.md) | [SvelteKit](frameworks/sveltekit/README.md) | [Solid](frameworks/solid/README.md) |
| [Web Components / Lit](frameworks/web-components/README.md) | [Tailwind CSS](frameworks/tailwind/README.md) | [Eleventy, Hugo, Jekyll](frameworks/static-sites/README.md) |

**Using Tailwind?** It needs a few extra lines so Tailwind's Preflight reset doesn't erase TagBrush.css. See the [Tailwind guide](frameworks/tailwind/README.md).

**Using Shadow DOM?** Page stylesheets can't reach inside a shadow root, so use `tagbrush.shadow.css` there. It targets `:host` instead of `html` and `body`. See the [Web Components guide](frameworks/web-components/README.md).

## Project files

| File                      | Purpose                                              |
|---------------------------|------------------------------------------------------|
| `tagbrush.css`            | The library itself (hand-written source of truth)    |
| `tagbrush.min.css`        | Minified build *(generated)*                         |
| `tagbrush.scoped.css`     | Scoped build that only styles inside `.tagbrush` *(generated)* |
| `tagbrush.scoped.min.css` | Minified scoped build *(generated)*                  |
| `tagbrush.shadow.css`     | Shadow DOM build for Web Components, styles `:host` *(generated)* |
| `tagbrush.shadow.min.css` | Minified Shadow DOM build *(generated)*              |
| `frameworks/`             | Setup guides for each framework                      |
| `index.html`              | Landing page, live demo, and theme builder           |
| `starter.html`            | A complete page to copy as a starting point          |
| `starters/`               | Pandoc, Hugo, Eleventy, and Astro starters (built by CI) |
| `llms.txt`, `llms/`       | Guide for AI assistants: an index and detail files   |
| `llms-full.txt`           | The whole guide in one file *(generated)*            |
| `bin/tagbrush.mjs`        | `npx tagbrush check`, a dependency-free page checker |
| `ai/`                     | Claude Code skill, Cursor rules, and `AGENTS.md` section *(generated from the guide)* |
| `scripts/build.mjs`       | Generates the files above                            |
| `tests/`                  | Cross-browser tests and screenshot baselines         |
| `CHANGELOG.md`            | Release history                                      |
| `ROADMAP.md`              | Planned work, one chunk per pull request             |
| `AGENT.md`                | Design notes and development plan                    |

## Contributing

Issues and pull requests are welcome. TagBrush.css aims to stay small and build-free for its users, so changes should be plain CSS inside the `@layer tagbrush` block of `tagbrush.css` that styles standard HTML elements and reads from the theme variables. Check new rules in both light and dark mode.

The build and tests are for maintainers only:

```sh
npm install
npx playwright install      # once, to download test browsers
npm run build               # regenerate the min and scoped files; commit them
npm test                    # cross-browser checks and screenshot comparison
npm run test:update         # accept intentional visual changes
```

CI fails if the generated files are out of date, so run `npm run build` before committing.

### Releasing

1. Update the version in `package.json` and add an entry to `CHANGELOG.md`.
2. `npm run build` (this also stamps the version into the CSS header) and commit.
3. Tag the commit (`git tag v1.2.3 && git push --tags`) and run `npm publish`.

## License

Licensed under the [Apache License, Version 2.0](LICENSE).
