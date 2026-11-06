# Roadmap

Work is done one chunk at a time, one pull request each. Tick items off as they merge.

## Guiding principle

TagBrush.css is for people who know HTML and want good-looking pages fast: drop one `<link>` into an HTML or Markdown-generated page and it looks finished, without adding classes or inline styles. Many of these users build with frameworks to write less code, so framework compatibility stays a priority.

The test for every change: **does it make more plain, semantic HTML look right without asking the user to learn something new?**

- Prefer styling semantic HTML and ARIA (`role`, `aria-*`, native attributes) over adding classes.
- Size is not the main constraint. Covering more HTML matters more than bytes, within a budget of **10 KB gzipped** (CI enforces this).
- Everything stays plain CSS inside `@layer tagbrush`, readable from the theme variables, with no build step for users.
- Default colors must meet WCAG AA in light and dark mode (CI enforces this).

## Chunk 1: 1.0.1, accessible defaults and guard rails

- [x] `--color-primary` changed to `#2563eb` so white button text and links reach 5.17:1 (it was 3.68:1).
- [x] Links and `.outline` button text are lightened 35% in dark mode (6.4:1 on the page, 5.3:1 on cards).
- [x] Light `--color-text-muted` changed to `#646b76` (4.88:1 on `--color-surface`; it was 4.39:1).
- [x] Contrast test: every default text/background pair in both schemes (`tests/fixtures/contrast.html`).
- [x] Size budget test: `tagbrush.min.css` must be at most 10 KB gzipped.
- [ ] After merging: tag `v1.0.1`, `npm publish`, date the CHANGELOG entry, create the GitHub release.

## Chunk 2: 1.1.0, classless page layout

Goal: `<body><header>…</header><main>…</main><footer>…</footer></body>` looks like a finished page with no classes.

- [x] **Auto-centering:** the content of `body > header`, `body > main` and `body > footer` is centered and limited to `--container-max-width`, with `--container-padding` on the sides. `.container` keeps working the same.
- [x] **Sticky footer with flexbox:** `body` becomes a flex column at least as tall as the viewport, and `main` grows to fill it, so the footer sits at the bottom on short pages. This is the one place where flexbox by default helps everyone: it fixes a common layout problem and needs nothing from the user. (Everything in TagBrush only uses bottom margins, so losing margin collapsing between `body` children changes nothing.)
- [x] **Opt out** with `data-layout="full"` on `<body>`, a wrapper, or a single landmark.
- [x] Full-width backgrounds: landmarks span the page and center their content with padding, so backgrounds reach the edges.
- [x] Framework wrappers: a class-free wrapper around the landmarks (`<div id="root">`, `<app-root>`) counts as the page.
- [x] Scoped and Shadow DOM builds leave page layout out: they style part of a page that something else lays out.
- [x] Quick start no longer needs `class="container"`.
- [ ] To discuss: a narrower reading width (about 70 characters) for text-heavy pages such as Markdown output, for example a separate `--content-max-width`.

**Not planned: flexbox on general elements** (`div`, `section`, `article`). Turning normal block flow into flex changes how all content lays out, and users would have to undo it more often than they'd want it. Rows and columns are already covered by `nav` (flex), `[role="group"]` (flex row) and `.grid`. To discuss: should a `<section>` that contains only `<article>`s lay them out as a responsive grid automatically?

## Chunk 3: Markdown and starter template

- [x] Test page of typical Markdown→HTML output (headings with ids, nested and task lists, tables without `<figure>`, code blocks with language classes, footnotes, images in paragraphs), with assertions and a screenshot.
- [x] Fix whatever that page shows up: long URLs widened the page, wide tables overflowed (now they scroll inside themselves, like GitHub), `align` on cells was ignored, task lists showed a bullet and a checkbox, and footnotes weren't set apart.
- [x] A starter `starter.html` (nav, main, form, footer) that people can copy, linked from the README.

## Chunk 4: Semantic components, no classes

- [x] Toggle switch: `<input type="checkbox" role="switch">`.
- [x] Loading state: `[aria-busy="true"]` shows a spinner on buttons and containers.
- [x] Breadcrumbs: `nav[aria-label="breadcrumb"]` with separators.
- [x] Dialog layout: `dialog > header` and `dialog > footer`, with footer buttons aligned right.
- [x] Accordion: neighboring `<details>` (especially `details[name]`) join into one bordered group.

## Chunk 5: Finishing touches

- [x] Text areas without a `rows` attribute grow with their content (`field-sizing: content`). A `rows` attribute keeps the fixed size the author chose.
- [x] `caret-color` from the theme.
- [x] Indeterminate `progress`: no CSS needed. Native bars already animate in every browser (checked in Chromium and WebKit).
- [x] Read-only fields (`[readonly]`, not `:read-only`, which also matches checkboxes and buttons).
- [x] Select arrow drawn with two gradients in `--color-text-muted`, so it follows the theme. (`mask-image` can't be used: it would hide the whole select.)
- Not doing: setting `accent-color` once on `:root`. An inherited color is computed where it's set, so a nested `--color-primary` override would no longer reach checkboxes and progress bars. Setting it on each element is what keeps nested theming working.
- Not doing: `scrollbar-color`. `color-scheme` already gives dark scrollbars in dark mode, and custom scrollbar colors replace macOS's overlay scrollbars with always-visible ones.

## Chunk 6: Safe theming

- [x] Button text is picked automatically: white or black, whichever contrasts more, using relative color syntax (`oklch(from …)`), which every evergreen browser supports. `contrast-color()` isn't needed. Links and outline text clamp the primary's lightness so they pass on the background and surface in both schemes. The contrast test runs with 10 primaries, from black to white and including the presets.
- [x] Theme builder shows the measured contrast of button text and links.
- [x] Share link: the theme is kept in the page URL's query string (the hash is used by the page's section links).

## Chunk 7: Docs and positioning

- [ ] README leads with the "drop in a link" user: plain HTML, Markdown output and static site generators first, framework guides second.
- [ ] "TagBrush.css compared to Pico, Simple.css and Water.css" section: your CSS always wins thanks to `@layer`, the scoped and Shadow DOM builds, and the framework guides.

## Out of scope

These would add things to learn and work against the classless goal:

- Component classes (`.navbar`, `.modal`, `.alert-*`) and utility classes
- A column grid system
- Tooltips via `data-` attributes
- JavaScript, icon fonts
- Sass or PostCSS sources
- Extra theme files (the theme builder covers this)
