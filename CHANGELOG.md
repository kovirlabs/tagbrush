# Changelog

All notable changes to TagBrush.css are listed here. This project follows [Semantic Versioning](https://semver.org/): variable names and the selectors you can rely on only change in a major release.

## Unreleased

### Docs

- The demo page has the Tag family bar and footer, in the family brand (kovirlabs.github.io/tagstack/brand.css). The demo itself keeps TagBrush.css's default look. Tests leave the brand out, so they check TagBrush.css alone.

## 1.2.0 (2026-11-07)

Model output in chat apps gets its own styles, and the "plain" gap the benchmarks found is closed: status badges, icons, heroes with a picture, full-height sidebars, and footer columns that agents used to build with custom CSS now come from plain HTML.

**Upgrading from 1.1:** no classes, variables, or selectors were removed, but a few existing pages change how they look: page heroes (an `<hgroup>` in the page header) get a soft tint of the primary color (set `--hero-background: none` to turn it off), an inline `<svg>` without `width` or `height` inside buttons, links, headings, and similar text is now sized to the text, and a page footer with two or more `<nav>`s becomes columns.

### Added
- Chat and AI output (roadmap chunk 19): `data-density="compact"` for a chat column (also on the `class="tagbrush"` element of the scoped build and on a Shadow DOM host); a reasoning block, `<details data-reasoning>` (and Open WebUI's `type="reasoning"`); citation chips for `<sup><a>`; GitHub alerts and Python-Markdown/MkDocs admonitions as colored callouts; KaTeX and MathJax block math scroll in a narrow column (block MathML too, in Chromium); a code block that has just opened keeps a line's height while a reply streams in.
- Pandoc task lists (the checkbox inside a `<label>`) lose their bullet, like other Markdown task lists.
- `llms.txt` links to the Tag family guide (https://kovirlabs.github.io/tagstack/llms.txt), which explains how TagBrush.css, TagAction, and TagCheck fit together.
- Status badges: `<mark data-tone="success">` (also `warning`, `error`, `info`, `neutral`) is a tinted pill whose text meets 4.5:1 in both schemes. Any color works with `style="--tone: #db2777"`. `data-tone` also colors an `<aside>` callout in an article.
- Icons: an inline `<svg>` without `width` or `height` in a button, link, heading, label, list item, table cell, or badge is sized to the text and lined up with it; buttons put a gap between icon and label. An icon first in a card of an article grid sits on a tinted tile.
- Hero with a picture: a `<figure>`, `<img>`, `<picture>`, or `<svg>` in the page header beside the `<hgroup>` sits next to the text (below it on phones). Heroes get a soft tint of the primary color, set by `--hero-background` (`none` turns it off).
- Full-height sidebar: an `<aside>` placed before the `<header>` runs the full height of the window, with the header as a top bar beside it.
- Footer columns: a page `<footer>` with two or more `<nav>`s lays them out as columns of links, with a last paragraph spanning the width.
- A `<p>` before the heading in an `<hgroup>` is a small uppercase label in the link color.

### Fixed
- `<hgroup>` muted every child after the first, so a label before the heading muted the heading. Now only the non-heading children are muted.

## 1.1.0 (2026-11-05)

The biggest release since 1.0: plain HTML now gets a full page layout, Markdown and highlighted code look right, apps and dashboards need no classes, any brand color stays readable, and AI agents get a guide, instruction files, and a page checker.

**Upgrading from 1.0:** most pages look the same or better, but check these visible changes (details under "Changed"): a `<main>` without `.container` is now centered, tables are as wide as their content and scroll when wide, the default blue is darker for contrast, and neutral colors take a faint tint of `--color-primary`. Add `data-layout="full"` to `<body>` to keep the old full-width layout.

### Added
- `npx tagbrush check`: a dependency-free command that reports missing alt text and labels, `<label for>` without a matching `id`, empty buttons and links, clickable `<div>`s, invented classes, layout CSS, skipped headings, duplicate ids, and a missing `lang` or viewport. `--json` for tools, exit code 1 on errors.
- Dropdown menus: a `<nav>` inside a popover is a vertical list, for user menus in the top bar.
- Debug mode: `data-tagbrush="debug"` outlines images without `alt`, unlabeled form fields, empty buttons and links, clickable `<div>`s, unused classes, and inline layout styles, in pure CSS.
- App patterns, no classes: `<aside>` next to `<main>` becomes a sidebar layout with vertical navigation (stacked on phones); `<aside>` next to an `<article>` in `<main>` becomes a sticky table of contents; a `<dl>` whose items are `<div>`s becomes stat tiles; a `<header>` with a heading and buttons lays them out in one row; `<search>` and `<form role="search">` lay out filters in a row; an `<hgroup>` in the page header becomes a centered hero.
- Agent evaluation in `evals/`: pages written by AI agents that only had `llms.txt`, checked by the tests for overflow, contrast, invented classes, and layout CSS.
- Previous/next links: in a `<nav>`, a link with `rel="next"` moves to the far end of the row.
- Instruction files for AI coding agents in `ai/` (a Claude Code skill, a Cursor rule, and an `AGENTS.md` section), generated from `llms.txt` and included in the npm package.
- `llms.txt`: a usage cheat sheet for AI assistants, also served at kovirlabs.github.io/tagbrush/llms.txt, and a README section with a prompt to copy.
- Starters for Pandoc (one-liner and template), Hugo, Eleventy, and Astro in `starters/`, built by CI on every change.
- Code highlighting: tokens from Prism, highlight.js, Hugo (Chroma), Jekyll (Rouge), Pandoc, and Pygments get theme colors that meet 4.5:1 in light and dark mode, set by `--code-*` variables. Shiki's dual themes (`defaultColor: false`, including Astro's built-in Shiki) follow the color scheme, and its `css-variables` theme uses the same palette.
- Reading width: pages without `<main>` (such as Markdown output) and a `<main>` holding a single `<article>` are kept to `--reading-width` (70 characters) for comfortable reading.
- Article grids: a `<section>` of two or more `<article>`s becomes a responsive grid of cards, no classes needed.
- Classless page layout: `header`, `main`, and `footer` stretch edge to edge with their content centered in `--container-max-width`, and the footer stays at the bottom of short pages. A page without `<main>` (such as Markdown output) is centered as a whole. Works through a framework wrapper without a class (`<div id="root">`, `<app-root>`).
- `data-layout="full"` on `<body>`, a wrapper, or one landmark turns page layout off there.
- Markdown output: task-list checkboxes replace the list bullet, footnotes (GitHub-flavored Markdown, markdown-it, Pandoc) are smaller and muted and highlight when linked to, and the `align` attribute on table cells is respected.
- Long URLs and words wrap instead of widening the page.
- `starter.html`, a complete page to copy as a starting point.
- Toggle switches: `<input type="checkbox" role="switch">`. Uses system colors in forced-colors mode and flips for right-to-left text.
- Loading state: `aria-busy="true"` on a button or any element shows a spinner (slower with reduced motion).
- Breadcrumbs: `<nav aria-label="Breadcrumb">` gets `/` separators that screen readers skip.
- Dialog layout: a `header` with a close button puts it beside the title, and a `footer` lines its buttons up on the right. Works with or without a `<form method="dialog">` around the content.
- Neighboring `<details>` join into one accordion. Give them the same `name` to let only one open at a time.
- A `<textarea>` without a `rows` attribute grows as you type, starting at three lines.
- Read-only fields (`readonly`) get the surface background but keep full-contrast text.
- The text cursor in fields uses the theme's link color.
- Theme builder: shows the contrast of button text and links as you pick colors, keeps the theme in the page URL so you can share it, and has a live preview.

### Fixed
- Default colors meet WCAG AA contrast (4.5:1) in light and dark mode, checked by the tests for ten different primary colors. `--color-primary` is now `#2563eb` (was `#3b82f6`, 3.7:1 with white text) and muted text is darker.
- Inline SVGs with `width`, `height`, and `viewBox` attributes keep their proportions when they shrink to fit a narrow container, instead of keeping their full height.
- A `.visually-hidden` element inside a scrolling table or figure no longer widens the page.
- `<ins>` and `<del>` keep 4.5:1 contrast inside muted text on a surface, such as a stat card.

### Changed
- Visual identity: background, surface, text, muted, and border colors carry a faint tint of `--color-primary`'s hue, so one color sets a matching palette (the default blue looks almost the same as before). `h1` and `h2` grow with the screen and have slightly tighter letter spacing. Links in running text are softly underlined. The page header and footer get hairline rules, a `<section>` after other content gets more room above it, and blockquotes get a primary-tinted rule.
- Any `--color-primary` now stays readable: button text switches automatically between white and black (`--color-on-primary` was always white, which failed contrast on lighter colors like amber or emerald), hover goes darker or lighter to match, and links and outline buttons are darkened (light mode) or lightened (dark mode) only as far as needed. The default link color is a slightly darker blue. Setting `--color-on-primary` or `--color-link` still overrides this.
- The select arrow follows the theme (`--color-text-muted`) instead of a fixed gray image.
- Tables are as wide as their content and scroll sideways inside themselves when they don't fit, so wide tables no longer widen the page on phones. Tables inside `<figure>` still fill the full width.
- Pages that use `<main>` without `.container` were full width and are now centered. Add `data-layout="full"` to `<body>` to keep the old behavior. Pages using `.container` look the same as before. The scoped and Shadow DOM builds are unchanged.

## 1.0.0 (2026-11-04)

First versioned release.

### Added
- `@layer tagbrush` cascade layer so your own CSS always wins.
- Automatic dark mode with `light-dark()` colors, plus `data-theme="light|dark"` on any element.
- Theme variables for colors, fonts, a full type scale, a single `--spacing` knob, container width, focus rings, shadows, and transitions.
- Component variables: `--button-padding`, `--button-radius`, `--button-font-weight`, `--input-padding`, `--input-radius`, `--card-padding`, `--card-radius`.
- `--font-family-heading`, `--color-heading`, `--color-link`, `--color-link-hover`, `--color-marker`, `--color-warning`.
- Classless styles for inline text (`mark`, `kbd`, `abbr`, `del`, `ins`, `s`, `dfn`, `sub`, `sup`, `small`, `output`), `hr`, `address`, `hgroup`, `dl`, `menu`, media, `figure`, `nav`, `search`, `article aside` callouts, `details`, `dialog`, `[popover]`, `progress`, `meter`, every input type, `optgroup`, multi-selects, validation states, wrapped labels, and help text.
- Layout helpers: `.grid`, `.card`, `[role="group"]`, `.striped` tables, `.visually-hidden`.
- Button variants `.secondary` and `.outline`.
- Reduced-motion and print styles.
- `tagbrush.min.css`, and a scoped build (`tagbrush.scoped.css`) that only styles inside `.tagbrush`.
- npm package, theme builder on the demo page, and cross-browser tests.
- Shadow DOM build (`tagbrush.shadow.css`, `tagbrush/shadow`) for Web Components, Lit, Stencil, and Angular `ViewEncapsulation.ShadowDom`.
- Setup guides in `frameworks/` for Astro, Next.js, React, React Router, Vue, Nuxt, Angular, SvelteKit, Solid, Web Components, Tailwind CSS, and static site generators.
