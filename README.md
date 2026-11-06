<h1 align="center"><code>&lt;tagbrush&gt;</code></h1>

<p align="center"><strong>TagBrush.css</strong></p>

**Make plain HTML look finished. One `<link>`, no classes.**

You know HTML and want a page that looks good now: a landing page, docs, a blog, a Markdown export, an internal tool. Add one stylesheet and write ordinary HTML. The page is laid out, the forms and tables are styled, dark mode follows the system, and any brand color you pick stays readable. No classes to learn, no build step, no JavaScript, about 5 KB gzipped.

When you do want to customize, a few CSS variables re-theme everything, and any CSS you write wins without `!important`. The same file works in plain HTML, static site generators, and every major framework.

👉 **See it in action:** [kovirlabs.github.io/tagbrush](https://kovirlabs.github.io/tagbrush/) has a live demo of every styled element, plus a theme builder that writes your custom CSS for you.

---

## Quick start

Add one line to your `<head>`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tagbrush@1/tagbrush.min.css">
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

**Converting Markdown?** Add the `<link>` to the page template of your static site generator, or to the HTML that Pandoc, markdown-it, or marked outputs. Headings, code blocks, task lists, tables (including column alignment), and footnotes are all styled, and wide tables scroll instead of widening the page.

### Versioning

The `@1` in the URL gets fixes and new features, but never breaking changes. To lock to one exact release, use the full version, for example `tagbrush@1.0.0`.

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
- **Any color stays readable** – pick any `--color-primary` and button text switches between white and black, while links darken or lighten as needed. The tests check WCAG AA contrast for 10 different primary colors in light and dark mode.
- **Dark mode** – follows the system setting automatically, or force it per page or per element with `data-theme`.
- **Easy to override** – everything lives in a `@layer`, so any CSS you write wins without `!important`.
- **Themeable** – colors, fonts, type scale, spacing, and radius are semantic CSS variables, and one variable re-themes everything. The [theme builder](https://kovirlabs.github.io/tagbrush/#theming) writes the CSS for you.
- **Accessible** – WCAG AA contrast, visible keyboard focus rings, `prefers-reduced-motion`, forced-colors support, and print styles.
- **Small helpers when you want them** – `.grid`, `.card`, `.container`, and `role="group"` cover the layouts most sites need.
- **No build step, no dependencies** – plain CSS you can link, copy, or import. About 5 KB minified and gzipped.
- **Works with any framework** – import it once in your root layout. [Setup guides](frameworks/README.md) cover Astro, Next.js, React, Vue, Nuxt, Angular, SvelteKit, Solid, Web Components, and Tailwind.

## How it compares

TagBrush.css sits in the same family as [Pico CSS](https://picocss.com), [Simple.css](https://simplecss.org), and [Water.css](https://watercss.kognise.dev): drop-in stylesheets for semantic HTML. They're all good choices. Here's where they differ, measured from each package's current npm release (TagBrush.css 1.x, Pico 2.1.1, Simple.css 2.3.7, Water.css 2.1.1) in November 2026:

| | TagBrush.css | Pico CSS | Simple.css | Water.css |
|---|---|---|---|---|
| Size (minified, gzipped) | 5.2 KB | 11.4 KB (10.1 KB classless) | 2.7 KB | 3.5 KB |
| Works without classes | Yes | Yes (classless build) | Yes | Yes |
| Your CSS wins without `!important` (`@layer`) | Yes | No | No | No |
| Dark mode from the system setting | Yes | Yes | Yes | Yes |
| Force light or dark on any element | Yes (`data-theme`) | Yes (`data-theme`) | No | Separate light and dark files |
| Readable button text for a custom accent color | Automatic | Set by hand (`--pico-primary-inverse`), or use a prebuilt color theme | Set by hand (`--accent-text`) | Set by hand |
| Page layout with no classes | Centered landmarks, full-width backgrounds, sticky footer | Centered `main` (classless build) | Centered column | Centered body |
| Toggle switch, loading spinner | Yes | Yes | No | No |
| Style only part of a page | Yes (`@scope`, `class="tagbrush"`) | Yes (`class="pico"` builds) | No | No |
| Inside Web Components (Shadow DOM) | Yes (shadow build) | Yes | No | No |

**Choose Simple.css or Water.css** if the smallest possible file matters most and you don't need components like toggle switches or dialogs laid out for you. **Choose Pico** if you want its larger set of components, such as dropdown menus and tooltips. **Choose TagBrush.css** if you want plain HTML to look finished without classes, need your own CSS to win cleanly, or want any brand color to stay readable.

## What gets styled

| Category   | Elements                                                                 |
|------------|--------------------------------------------------------------------------|
| Typography | `h1`–`h6`, `hgroup` (muted subtitle), `p`, `a`, `strong`, `small`, `mark`, `abbr`, `del`, `ins`, `s`, `dfn`, `q`, `sub`, `sup`, `hr`, `address`, `blockquote` (with `footer` attribution), `code`, `pre`, `kbd`, `samp`, `output` |
| Lists      | `ul`, `ol`, `menu` (including nested lists, muted `::marker`), Markdown task lists (checkbox replaces the bullet), `dl`, `dt`, `dd` |
| Media      | `img`, `picture`, `video`, `audio`, `canvas`, `svg`, `iframe`, `object`, `embed` (scale to fit), `figure`, `figcaption` |
| Code highlighting | Token colors for Prism, highlight.js, Hugo (Chroma), Jekyll (Rouge), Pandoc, and Pygments output, and Shiki's dual themes and `css-variables` theme. Follows the theme and dark mode; a highlighter theme you load yourself still wins |
| Markdown   | Footnotes from GitHub-flavored Markdown, markdown-it, and Pandoc (smaller, muted, highlighted when linked to); long URLs and words wrap instead of widening the page |
| Article grids | A `<section>` of two or more `<article>`s becomes a responsive grid of cards |
| Structure  | `nav` (with `ul`/`menu` rendered as a horizontal menu, `aria-current` highlighted), `header`, `main`, `footer`, `search`, `article aside` (callout), breadcrumbs (`<nav aria-label="Breadcrumb">` gets `/` separators) |
| Buttons    | `button`, `input[type=submit/button/reset]`, `.button`, `:disabled`, `aria-disabled` |
| Loading    | `aria-busy="true"` on a button or any element shows a spinner |
| Forms      | `fieldset`, `legend`, `label` (including inputs wrapped in their label), `textarea` (grows as you type unless it has a `rows` attribute), `select` (consistent arrow in the theme's colors), `select[multiple]`, `optgroup`, every text-like `input` type (including `date`, `time`, `search`, …), `checkbox`, `radio`, toggle switches (`<input type="checkbox" role="switch">`), `range`, `color`, `file`, `image` |
| Form states | `:focus`, `:disabled`, `readonly`, `::placeholder`, `aria-invalid="true"` / `"false"`, `:user-invalid`, help text via `<small>` after a field. Fields are spaced automatically. |
| Tables     | `table`, `caption`, `thead`, `tbody`, `tfoot`, `th`, `td`, and the `align` attribute. A table is as wide as its content and scrolls sideways inside itself when it doesn't fit. Wrap it in `<figure>` to make it fill the full width instead |
| Interactive | `details`, `summary` (neighboring `details` join into an accordion), `dialog` (with `::backdrop`; a `header` with a close button and a `footer` of right-aligned buttons), `[popover]`, `progress`, `meter` (green / amber / red from its `low`, `high`, and `optimum` attributes) |

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
- Pages that already use `.container` look exactly as before.

To lay out the page yourself, add `data-layout="full"` to `<body>` (or to the wrapper). To let just one landmark go edge to edge, for example a full-width hero, put it on that element: `<header data-layout="full">`. Giving the wrapper element a class also tells TagBrush.css it's your own layout.

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
| `--color-background`    | white / `#111827` | Page, input, and dialog backgrounds  |
| `--color-surface`       | `#f3f4f6` / `#1f2937` | Code, blockquotes, secondary buttons |
| `--color-text`          | `#1f2937` / `#f3f4f6` | Body text                       |
| `--color-heading`       | `--color-text` | Headings                                |
| `--color-text-muted`    | `#646b76` / `#9ca3af` | Captions, help text, placeholders, footers |
| `--color-border`        | `#e5e7eb` / `#374151` | Inputs, tables, rules, details  |
| `--color-highlight`     | `#fef08a` / `#713f12` | `<mark>` background             |
| `--color-error`         | `#dc2626` / `#f87171` | Invalid fields and their help text |
| `--color-success`       | `#16a34a` / `#4ade80` | Fields marked `aria-invalid="false"`, good `meter` values, `<ins>` |
| `--color-warning`       | `#d97706` / `#fbbf24` | Middling `meter` values         |
| `--color-marker`        | *derived*    | List bullets and numbers, `summary` arrows (defaults to muted text) |
| `--focus-ring-color`    | *derived*    | Focus outlines (primary at 50% opacity)   |
| `--focus-ring-width`    | `3px`        | Focus outlines and input focus rings      |
| `--font-family-base`    | system stack | All text                                  |
| `--font-family-mono`    | system mono  | `code`, `pre`, `kbd`, `samp`              |
| `--font-family-heading` | `--font-family-base` | Headings                          |
| `--font-size-base`      | `1rem`       | Body text, buttons, inputs                |
| `--font-size-sm`        | `0.875rem`   | `small`, captions, footers                |
| `--font-size-h1` … `--font-size-h6` | `2.25rem` – `1rem` | Heading sizes             |
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
| `--shadow` / `--shadow-lg` | soft shadows | Available for your components / dialogs |
| `--transition-duration` | `0.15s`      | Hover and focus transitions (`0s` with reduced motion) |
| `--button-padding` / `--button-radius` / `--button-font-weight` | spacing, radius, `500` | Buttons and file-picker buttons |
| `--input-padding` / `--input-radius` | spacing, radius | Text inputs, selects, textareas |
| `--card-padding` / `--card-radius` | `1.5rem` / radius | `.card`                       |

Where two defaults are shown, they are the light and dark values.

### Browser support

TagBrush.css uses modern CSS (`@layer`, `light-dark()`, `color-mix()`, `:has()`, `:where()`), supported by all evergreen browsers since 2024. It's tested in Chromium, Firefox, and WebKit on every pull request.

## Adding TagBrush.css to an existing site

`tagbrush.css` styles the whole page. To use it inside part of an existing site (a docs section, a CMS block, a widget) without touching anything else, use the scoped build and wrap that part in `class="tagbrush"`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tagbrush@1/tagbrush.scoped.min.css">

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
