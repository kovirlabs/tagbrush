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

- [ ] Test page of typical Markdown→HTML output (headings with ids, nested and task lists, tables without `<figure>`, code blocks with language classes, footnotes, images in paragraphs), with assertions and a screenshot.
- [ ] Fix whatever that page shows up, for example wide Markdown tables that can't be wrapped in `<figure>`, and task-list checkboxes.
- [ ] A starter `starter.html` (nav, main, form, footer) that people can copy, linked from the README.

## Chunk 4: Semantic components, no classes

- [ ] Toggle switch: `<input type="checkbox" role="switch">`.
- [ ] Loading state: `[aria-busy="true"]` shows a spinner on buttons and containers.
- [ ] Breadcrumbs: `nav[aria-label="breadcrumb"]` with separators.
- [ ] Dialog layout: `dialog > header` and `dialog > footer`, with footer buttons aligned right.
- [ ] Accordion: neighboring `<details>` (especially `details[name]`) join into one bordered group.

## Chunk 5: Finishing touches

- [ ] `textarea { field-sizing: content; }` so text areas grow with their content (browsers without support ignore it).
- [ ] `caret-color` and `scrollbar-color` from the theme.
- [ ] Animated `progress` with no value (indeterminate).
- [ ] Styling for `:read-only` fields.
- [ ] Set `accent-color` once on `:root` instead of on each element.
- [ ] Select arrow follows the text color (`mask-image` + `currentColor`) instead of the fixed `#8b929c`.

## Chunk 6: Safe theming

- [ ] Theme builder presets fail contrast with white button text: emerald 2.5:1, amber 2.2:1, rose 3.7:1, violet 4.2:1. Pick button text automatically (`contrast-color()` where supported, with a fallback), or have the builder output a matching `--color-on-primary`.
- [ ] Theme builder shows a contrast warning for custom colors.
- [ ] "Share this theme" link (theme stored in the URL hash).

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
