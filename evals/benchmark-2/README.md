# Benchmark 2: reproducing a design

[Benchmark 1](../benchmark/) found that TagBrush.css pages cost 3–4× less markup per word of content and had no contrast failures, but looked plainer than what agents built with Tailwind or their own CSS. Its pages also differed in content and ambition, so the comparison wasn't like for like.

This benchmark fixes both: every agent reproduces **the same design with the same text**, and the TagBrush.css agent may add a small stylesheet where the design needs more than TagBrush.css gives.

## Reference designs

Two polished pages from benchmark 1, one from each competing approach so neither is favored: the hand-written CSS landing page and the Tailwind dashboard (both fictional products). Agents received only screenshots and text, never the source:

- [`reference/`](reference/): `{page}-1.png`, `-2.png`, … (1280px wide, light mode, top to bottom), `{page}-phone.png`, `{page}-dark.png`, and `{page}.txt` with the exact copy.

## Approaches

Each agent was told to reproduce the design as closely as possible, working on phones and in dark mode, using only the reference folder:

| File | Approach | Instructions |
|---|---|---|
| `*.tagbrush-plus.html` | TagBrush.css + small CSS | Read `llms.txt` and write semantic HTML following it. Add one small `<style>` block with only the CSS needed to match the design, reusing TagBrush.css variables, styling semantic elements rather than adding classes, and keeping it as small as possible. |
| `*.tailwind.html` | Tailwind (CDN) | Use Tailwind from its CDN, the way it normally would. |
| `*.plain-css.html` | Hand-written CSS | Write all the CSS in a `<style>` block. |

Run `node scripts/benchmark.mjs evals/benchmark-2` to measure the pages; it writes [`RESULTS.md`](RESULTS.md).

## What went wrong, and how it was handled

- **The dashboard's dark screenshot was light.** The reference dashboard turns dark with a script at page load, and the screenshot emulated dark mode after loading. All three dashboard agents got the same image and chose their own dark colors, so it's fair between them, but dark-mode fidelity isn't comparable for the dashboard. (The corrected `dashboard-dark.png` was saved after the runs.)
- **The landing text had one FAQ answer.** The other five were collapsed when the text was captured, so every agent wrote its own short answers, adding a little copy that differs by page.
- **The TagBrush.css agents first previewed an outdated stylesheet.** The CDN link `tagbrush@1` serves 1.0.0, the only published version, which lacks the layout features `llms.txt` describes. The first landing attempt wrote about 130 lines of CSS rebuilding centering, card grids, and the hero. Both TagBrush.css pages were redone with identical instructions plus one: preview with the current local stylesheet and hand in the CDN link. The first attempts are kept in [`stale-cdn/`](stale-cdn/) and not measured. The same problem will hit real agents until 1.1.0 is published.
- **Some agents checked their work in a browser and some didn't.** Checking improves fidelity; it's noted per page in the findings.

## Limits

- One page per design and approach.
- The similarity score is a coarse pixel comparison of the first screen. Judge fidelity from the screenshots.
- The references came from benchmark 1, so the agent that built a reference used the same approach as one of the competitors here. They saw screenshots only, but the hand-written CSS and Tailwind approaches may still find their own reference natural to reproduce.

## Findings (November 2026)

Full numbers are in [`RESULTS.md`](RESULTS.md); side-by-side screenshots of each approach against the reference are in [`comparisons/`](comparisons/).

**Fidelity is the same.** All three approaches reproduce both designs closely: the hero with its app mockup, the pricing cards with the highlighted plan, the dashboard's sparklines, status pills and full-height sidebar. The coarse similarity score is 86.9–88.4% for every page, and the screenshots agree; the TagBrush.css pages differ only in a little looser spacing in places.

**The cost is not.** With the same text and the same design:

| | Output tokens (dashboard / landing) | Markup per text token, without SVG | Lines of CSS written |
|---|---:|---:|---:|
| TagBrush.css + small CSS | **6,535 / 7,970** | **6.5 / 5.1** | **85 / 131** |
| Tailwind (CDN) | 10,190 / 12,546 | 11.2 / 7.4 | — (1,133 / 1,507 classes) |
| Hand-written CSS | 9,664 / 12,272 | 11.2 / 7.7 | 217 / 316 |

TagBrush.css plus a small stylesheet produced the same pages with **about 35% fewer output tokens** and less than half the CSS of hand-written pages, using 7 and 10 classes (all documented TagBrush.css ones) against 1,133 and 1,507 Tailwind classes.

**Robustness.** Both Tailwind and hand-written dashboards scroll sideways on a phone; the TagBrush.css pages don't. Contrast failures: 2 and 14 (light) for TagBrush.css + small CSS, 5 and 19 for Tailwind, 3 and 45 for hand-written CSS. The TagBrush.css failures come from the agents' own color overrides made to match the reference, such as white text on the orange button: the reference itself fails WCAG there, and TagBrush.css's automatic contrast would have chosen dark text. Matching a design exactly and staying accessible can pull in different directions.

**Which agents checked their work in a browser:** both TagBrush.css pages, both hand-written CSS pages, and the Tailwind landing page; not the Tailwind dashboard.

**Compared with [benchmark 1](../benchmark/)**, where TagBrush.css pages were 5–8× smaller but plainer: given a design to match, TagBrush.css doesn't hold an agent back visually, and the savings shrink to about a third, because the bespoke parts of a design (an app mockup, sparklines, a pricing toggle) need custom CSS in every approach.

**What the TagBrush.css agents had to work around** (now on the roadmap, chunk 21):

- A full-height sidebar with the top bar beside it, rather than a header across the top. One agent turned the built-in layout off and wrote its own grid.
- `<hgroup>` with a small label before the heading (`<hgroup><p>Pricing</p><h2>…</h2></hgroup>`, allowed by HTML) mutes the heading, because TagBrush.css mutes every child after the first.
- Status colors: both agents invented the same fix, an inline `--tone` variable per badge turned into a tinted background by one rule. That's a good candidate for a built-in pattern.

## Re-run after chunk 21 (November 2026)

The two TagBrush.css + small CSS pages were written again by new agents with the same instructions, after TagBrush.css gained status badges (`data-tone`), icon sizing, a hero with a picture, a full-height sidebar, footer columns, and `<hgroup>` labels. They're in [`rerun/`](rerun/), with side-by-side screenshots (reference, before, after) in `rerun/*-compare.png`. Run `node scripts/benchmark.mjs evals/benchmark-2/rerun` to measure them.

| | Output tokens | CSS tokens | Lines of CSS | Classes | Contrast failures (light / dark) | Similarity |
|---|---:|---:|---:|---:|---|---:|
| Dashboard, before | 6,535 | 2,182 | 87 | 7 | 2 / 4 | 87.1% |
| Dashboard, after | **6,138** | **1,200** | **60** | **0** | 0 / 1 | 86.1% |
| Landing, before | 7,970 | 3,548 | 133 | 10 | 14 / 1 | 88.4% |
| Landing, after | 8,073 | 3,806 | 138 | 9 | 13 / 2 | 85.8% |

- **The dashboard needed 45% less CSS and no classes.** The agent used the full-height sidebar, badges, and icons as built, and wrote CSS only for the segmented period switch, the product rows, and the sparkline colors.
- **The landing page didn't get smaller.** Its CSS goes mostly to parts no stylesheet ships: the app mockup with its bar chart and toast, the pricing toggle, the FAQ's look, a dark call-to-action box. The agent did use the new hero with a picture and the label above headings, but had to move paragraphs after the buttons back beside the picture; that gap was fixed in the same change, so a run today would need a few lines less.
- **Contrast failures are unchanged in kind:** they come from the agents' own colors, mostly white text on the reference's orange (3.6:1), which TagBrush.css would have drawn in black.
- **The re-run dashboard scrolls 8px sideways on a phone** because its own CSS forces the top bar onto one row; the original didn't.
- Single runs vary; a difference of a few hundred tokens on the landing page is within that noise.
