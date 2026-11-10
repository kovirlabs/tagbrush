# Roadmap

Work is done one chunk at a time, one pull request each. Tick items off as they merge.

## Guiding principle

TagBrush.css is for people who know HTML and want good-looking pages fast: drop one `<link>` into an HTML or Markdown-generated page and it looks finished, without adding classes or inline styles. Many of these users build with frameworks to write less code, so framework compatibility stays a priority.

The test for every change: **does it make more plain, semantic HTML look right without asking the user to learn something new?**

- Prefer styling semantic HTML and ARIA (`role`, `aria-*`, native attributes) over adding classes.
- Coverage is the point, not size. Every pattern TagBrush.css lacks costs a site 50–150 lines of its own CSS, far more than the bytes the pattern adds, so covering more HTML wins over shaving bytes. A ceiling of **15 KB gzipped** (CI enforces this) only guards against accidental bloat; report the size in each release rather than designing around it.
- The real costs of a pattern, checked for each one instead:
  - **False matches.** A pattern fires on markup written for other reasons. Each one needs a test that nearby markup it shouldn't touch is left alone (a plain `<ol>` next to a list of steps).
  - **Guide length.** Agents read `llms.txt` on every page they build, and a longer guide is followed less carefully. A pattern earns its place in one or two lines, and CI caps the guide at **4,000 tokens**.
  - **Selectors are a promise.** Selectors people rely on only change in a major release, so a pattern is kept for good.
- Everything stays plain CSS inside `@layer tagbrush`, readable from the theme variables, with no build step for users.
- Default colors must meet WCAG AA in light and dark mode (CI enforces this).

## Chunk 1: 1.0.1, accessible defaults and guard rails

- [x] `--color-primary` changed to `#2563eb` so white button text and links reach 5.17:1 (it was 3.68:1).
- [x] Links and `.outline` button text are lightened 35% in dark mode (6.4:1 on the page, 5.3:1 on cards).
- [x] Light `--color-text-muted` changed to `#646b76` (4.88:1 on `--color-surface`; it was 4.39:1).
- [x] Contrast test: every default text/background pair in both schemes (`tests/fixtures/contrast.html`).
- [x] Size budget test: `tagbrush.min.css` must be at most 10 KB gzipped (raised to 15 KB in chunk 22).
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

- [x] Compact density for a chat column (tighter spacing and type, set with one attribute or variable), usable with the scoped build inside each message.
- [x] Stable layout while text streams in: no jumps when a half-finished table, list, or code block arrives.
- [x] A collapsible reasoning block: `<details>` holding a model's thinking.
- [x] Citations and sources: footnote-style references and a sources list at the end of an answer.
- [x] Math: KaTeX and MathML output.
- [x] Wide tables and long code lines that stay readable in a narrow column.
- [x] Integration snippets for common chat stacks (a Markdown renderer plus the scoped build).

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

## Chunk 22: Landing-page patterns, and coverage over size

Found by moving the Kovir LLC site onto TagBrush.css: patterns every marketing site writes by hand.

- [x] Steps (`<ol>` of headed items), a phone menu (`[popover]` in the header nav), a skip link, full-width bands (`<main data-layout="full">`), card improvements (edge-to-edge picture, buttons at the bottom, testimonials), a list of articles as cards, and a row of logos.
- [x] Guiding principle: coverage over size. The size ceiling goes from 10 KB to 15 KB gzipped, and `llms.txt` gets a 4,000-token cap.

## Chunk 23: Interaction, and styling from what the HTML means

An evaluation against modern-web practice found two gaps. TagBrush.css barely responds to the user: dialogs, popovers and pages snap instead of easing, and nothing shows that a table scrolls sideways. And several elements say what the author means but are styled like plain elements: a card whose heading is a link, a `<details>` in a nav, a link to a PDF. Everything here falls back to today's behavior in browsers without support, and motion stops under `prefers-reduced-motion`.

Next round:
- [x] Dialogs and popovers fade and scale in and out (`@starting-style`, `transition-behavior: allow-discrete`, `overlay`), backdrop included.
- [x] Cross-page fades with `@view-transition { navigation: auto }` (Chromium and Safari; Firefox navigates instantly).
- [x] A card whose heading is its only link is clickable all over, with a hover and focus state on the card.
- [x] A `<details>` in a header nav list is a dropdown menu, no JavaScript; inline in the phone menu panel.
- [x] Wide tables and code blocks show a shadow at an edge that has more content (scroll-driven, Chromium and Safari 26).
- [x] Header nav links are at least 44px tall on touch screens; hover effects only on devices that hover.
- [x] Links to documents (`.pdf`, `.docx`, `.xlsx`, `.csv`, `.zip`) and `download` links say what they are.

Later:
- [x] Choice cards: a `<fieldset>` of radio labels, the selected one highlighted (`label:has(:checked)`).
- [x] Pull quote (`figure > blockquote + figcaption`) and avatars (a small `<img>` in a testimonial footer or `<address>`). Both were on the round 1 "not yet" list.
- [x] Data tables: `<data>` values right-aligned in tabular figures, row hover. Not the sticky header: a `<figure>` scrolls sideways only, so `position: sticky` in it has nothing to stick to.
- [x] `<iframe>` without a `height` is 16:9 at full width (video embeds).
- [x] A sale price: `<s>` before a price is muted. Already true: `<s>` was muted since 1.1, so only the guide changed.
- [x] Themed `<select>` picker behind `@supports (appearance: base-select)`, for mouse users; `:user-valid` on fields with a rule. Not `:autofill`: browsers already tint autofilled fields, and that tint overrides TagBrush.css's field background anyway.
- [x] `scrollbar-color` from the theme; stronger borders under `prefers-contrast: more`.

Not planned: scroll-triggered reveal animations, parallax, and scroll progress bars (motion like this is a large part of what makes pages look generated), a sticky header by default (it changes every site's layout; maybe an opt-in pattern later), and a scrollspy table of contents (needs JavaScript, so TagAction).

**Open question: a less generic default look.** AI-built sites cluster around a few looks: a gradient hero on white, everything centered, the same radius and shadow on every block, icons on tinted tiles. Several TagBrush.css defaults touch these: the centered hero on a primary tint, an identical frame on every card, and the feature icon tile. Options for a 2.0, or behind theme variables: a start-aligned hero on a near-neutral tint, cards framed by role (a fill, no border once filled, a shadow only for the featured card), plain icons at heading size, and theme-builder presets with deliberate font pairings. Decide before starting.

## Chunk 24: A guide that can grow

Agents read `llms.txt` before writing a page, and the 4,000-token cap was forcing useful detail out: the "this is left alone" notes that keep a pattern from being tripped by accident, and fuller snippets. Input tokens are cheaper than the output they make more accurate, so the guide should be allowed to grow, but an agent can't look up a pattern it doesn't know exists, and some tools load rule files on every request.

- [x] `llms.txt` becomes an index that is always read: the rules, and every pattern in one line (the HTML and what it gives you), grouped by what you're building, each group linking to its detail file. Capped at 4,000 tokens.
- [x] Detail files read when the task needs them: `llms/pages.md`, `llms/apps.md`, `llms/forms.md`, `llms/content.md`, `llms/chat.md`, with full snippets, variations, and what each pattern leaves alone.
- [x] `llms-full.txt`: the index and every detail file in one, generated by the build, for tools that take a single file (the llms.txt convention).
- [x] Agent files generated to suit each tool: the Claude Code skill gets the index as `SKILL.md` and the detail files as references it reads on demand; Cursor gets one rule per topic, each with a description; `AGENTS.md` gets the full text.
- [x] CI: the snippet, class, attribute and variable contract tests cover every file; every pattern in a detail file must have its line in the index; the full guide has a 20,000-token bloat check.
- [x] Measure it: the landing-page and sign-up requests, each written by fresh agents with today's guide, the index alone, and the index with the detail files, compared on invented classes, layout CSS, patterns used, output length, and the automated checks.

  Result (evals round 3): all six pages clean with every guide; the index alone matched the full guide. The requests are too easy to separate them, so the next round uses harder ones and runs outside any project.

Follow-ups the round 3 agents reported, whatever guide they had:
- [ ] A price figure in a plan card (large amount, small period), and whether a feature list in a card is styled.
- [ ] A muted alternate band beside `data-theme="dark"`, and whether a closing call-to-action band is centered.
- [ ] Forms: an error message alongside help text, a list of password rules after a field, and `aria-describedby` in the examples.
- [ ] A harder evaluation round, run outside any project: requests that hit what each pattern leaves alone.

The CSS size ceiling follows the project's purpose too: it's raised when coverage needs it, and the size is reported in each release.

## Release

- [x] Prepare 1.1.0 with chunks 2–18 (version bump, dated CHANGELOG, comparison and size claims updated).
- [x] Publish: merge the release PR, `npm publish` (maintainer, two-factor), tag `v1.1.0`, GitHub release. Published 2026-11-05.
- [x] Prepare 1.2.0 with chunks 19 and 21 (version bump, dated CHANGELOG, size claims updated).
- [ ] Publish: merge the release PR, `npm publish` (maintainer, two-factor), tag `v1.2.0`, GitHub release. Until then `tagbrush@1` on the CDN serves 1.1.0, so the chat-output styles and badges in `llms.txt` don't work for agents yet.

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
