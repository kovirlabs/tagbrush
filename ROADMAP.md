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
- [x] Reading width for text-heavy pages: done in chunk 8.

**Not planned: flexbox on general elements** (`div`, `section`, `article`). Turning normal block flow into flex changes how all content lays out, and users would have to undo it more often than they'd want it. Rows and columns are already covered by `nav` (flex), `[role="group"]` (flex row) and `.grid`. A `<section>` of `<article>`s now lays them out as a grid (chunk 8).

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

- [x] README leads with the "drop in a link" user: plain HTML, Markdown output, and static site generators first, framework guides second.
- [x] "How it compares" section with Pico, Simple.css, and Water.css, measured from each package's current npm release (size, `@layer`, dark mode, theming, layout, scoped and Shadow DOM support). Re-measure when those libraries release new versions.

## Chunk 8: Reading width and article grids

- [x] `--reading-width` (70ch) for pages without `<main>` and for a `<main>` with a single `<article>`.
- [x] A `<section>` of two or more `<article>`s lays them out as a grid of cards.

## Chunk 9: Code highlighting

- [x] Colors for highlighted code from common generators (Prism, highlight.js, Shiki, Hugo/Chroma, Rouge), following the theme and dark mode. These classes come from the generator, not the user, like the footnote classes.

## Chunk 10: Starters

- [x] Ready-made starting points: a Pandoc one-liner and template, and minimal Hugo, Eleventy, and Astro starters in `starters/`.

## Chunk 11: AI-written pages

- [x] `llms.txt` and a README section on using TagBrush.css with pages written by AI assistants, which produce semantic HTML and have no class names to invent.

## Chunk 12: Visual identity

- [x] A design pass so a TagBrush page is recognizable: type scale, spacing rhythm, neutral palette, and a few signature details, without adding anything users must learn.

## Chunk 13: Instruction files for AI coding agents

- [x] A Claude Code skill, Cursor rules, and an `AGENTS.md` section, generated from `llms.txt` by the build so they never drift apart.

## Chunk 14: `llms.txt` contract test

- [x] Every HTML snippet in `llms.txt` is rendered in the tests and must be styled by TagBrush.css, and every class, attribute, and variable it mentions must exist in the stylesheet.

## Chunk 15: Agent evaluation

- [x] A fixed set of prompts (landing page, form, dashboard, blog post, docs page, admin table). Pages written by agents that only see `llms.txt` are kept in `evals/`, checked by the tests (no overflow, contrast, no invented classes), and reviewed to find gaps.

## Chunk 16: App and dashboard patterns

- [x] `<aside>` next to `<main>` becomes a sidebar layout, and next to an `<article>` a sticky table of contents; navigation in an aside is vertical; a `<dl>` of `<div>` groups becomes stat tiles; a header with a heading and buttons is one row; an `<hgroup>` in the page header is a hero.
- [x] Search and filter bars use `<search>` instead of the planned `role="toolbar"`: ARIA toolbars promise arrow-key navigation, which needs JavaScript.
- Not yet: badge colors, a featured card, multi-column footers, a danger button, pull quotes, avatars (reported by the round 1 agents).

## Chunk 17: Debug mode

- [x] `<html data-tagbrush="debug">` outlines common mistakes (images without `alt`, unlabeled fields, classes TagBrush doesn't use, empty buttons) in pure CSS, for people and for agents that take screenshots.

## Chunk 18: `npx tagbrush check`

- [x] A zero-dependency command that reports the same problems as text, plus page-level checks (missing `lang`, viewport, stylesheet link, label `for`/`id` pairs), for agents without screenshots.

## Chunk 19: The stylesheet for LLM output in chat apps

Chat interfaces render a model's Markdown as HTML and need CSS for it. TagBrush.css already styles most of it; these make it a natural fit inside a chat window:

- [ ] Compact density for a chat column (tighter spacing and type, set with one attribute or variable), usable with the scoped build inside each message.
- [ ] Stable layout while text streams in: no jumps when a half-finished table, list, or code block arrives.
- [ ] A collapsible reasoning block: `<details>` holding a model's thinking.
- [ ] Citations and sources: footnote-style references and a sources list at the end of an answer.
- [ ] Math: KaTeX and MathML output.
- [ ] Wide tables and long code lines that stay readable in a narrow column.
- [ ] Integration snippets for common chat stacks (a Markdown renderer plus the scoped build).

## Chunk 20: Discovery by AI tools

So agents find and use TagBrush.css on their own, not only when told to:

- [ ] A small MCP server: the guide, `check` as a tool, a theme from a brand color, and starter pages.
- [ ] Indexing in documentation services that coding agents query for library docs.
- [ ] Listings: `llms.txt` directories, Claude Code plugin and skill marketplaces, Cursor rule collections, classless-CSS lists, and npm keywords. Prepared here; submitted by the maintainer, since they post publicly.
- [ ] Defaults and examples in other tools: chat UIs, Markdown-to-HTML tools, and AI SDK examples.
- [ ] Keep the benchmark (`evals/benchmark/`) current and cite it, so the claims stay measured.

## Chunk 21: Close the polish gap

The benchmark (`evals/benchmark/`) showed TagBrush.css pages cost 3–4× less markup per word and have no contrast failures, but look plainer than what agents build with Tailwind or their own CSS. Make the default result look as designed as theirs, still without classes:

- [x] Status colors for badges (`<mark>` variants or a small attribute), the gap agents reported most.
- [x] A richer hero (a visual or figure beside the heading, a subtle background), and feature cards with an accent.
- [x] Inline SVG icons sized and aligned automatically in buttons, navigation, and headings.
- [x] A full-height sidebar variant: `<aside>` before `<header>` puts the top bar beside the sidebar instead of above it (benchmark 2).
- [x] Fix `<hgroup>`: mute the paragraphs, never the heading, so a label before the heading works (benchmark 2).
- [x] Consider a built-in `--tone` pattern for badges and icons, as both benchmark 2 agents invented it. (Done as `data-tone` plus `--tone`.)
- [x] Footer columns: a footer with several `<nav>`s, which both landing pages built by hand.
- [x] Re-run the benchmarks and compare screenshots side by side (benchmark 2, `evals/benchmark-2/rerun/`: dashboard CSS down 45%, landing unchanged).

## Release

- [x] Prepare 1.1.0 with chunks 2–18 (version bump, dated CHANGELOG, comparison and size claims updated).
- [x] Publish: merge the release PR, `npm publish` (maintainer, two-factor), tag `v1.1.0`, GitHub release. Published 2026-11-05.

## Open questions

None right now.

## Out of scope

These would add things to learn and work against the classless goal:

- Component classes (`.navbar`, `.modal`, `.alert-*`) and utility classes
- A column grid system
- Tooltips via `data-` attributes
- JavaScript, icon fonts
- Sass or PostCSS sources
- Extra theme files (the theme builder covers this)
