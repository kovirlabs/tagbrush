# Benchmark: TagBrush.css vs. Tailwind vs. hand-written CSS for AI-written pages

When an AI agent builds a page, how much does the styling approach cost in output, and how good is the result?

Each request was given to a separate agent three times, with one difference: how to style the page.

| File | Approach | What the agent was told |
|---|---|---|
| `*.tagbrush.html` | TagBrush.css | Read only `llms.txt` and follow it (semantic HTML, no invented classes, no layout CSS). From the agent evaluation in [`../pages/`](../pages/). |
| `*.tailwind.html` | Tailwind | Use Tailwind from its CDN, the way it normally would; make it polished and support dark mode. |
| `*.plain-css.html` | Hand-written CSS | No framework: write all the CSS in a `<style>` block; make it polished and support dark mode. |

The requests are the landing page and dashboard requests from [`../README.md`](../README.md), word for word. All agents used the same model and were told to use realistic content and write one self-contained file. The TagBrush dashboard is the round 2 page, written against the current `llms.txt`.

Run `node scripts/benchmark.mjs` to measure every page here; it writes [`RESULTS.md`](RESULTS.md) and `results.json`.

## Limits

- One page per request and approach: enough to show the size of the differences, not a statistical study. Add more requests and runs to firm it up.
- The agents are all one model family. Other models may write more or less markup.
- Token counts use the GPT-4o tokenizer as a stand-in; the ratios between approaches are the point.
- "Looks polished" isn't measured. Screenshots are the best check of that; every page here can be opened in a browser.

## Findings (November 2026)

Full numbers are in [`RESULTS.md`](RESULTS.md).

- **Output size.** The TagBrush.css pages are 1,771 and 2,060 tokens; the Tailwind pages 11,966 and 16,661; the hand-written CSS pages 8,351 and 11,898. That's 4.7–8.1× smaller, but the comparison isn't like for like (see below).
- **Cost per word of content.** The fairer measure removes the visible text and any inline SVG (icons, charts, logos) and divides by the visible text. TagBrush.css pages use 2.0–3.7 tokens of markup per token of text; hand-written CSS 7.6–10.6; Tailwind 7.7–14.2. Styling the same content costs **3–4× less** with TagBrush.css.
- **Quality.** Both TagBrush.css pages have **no contrast failures** in either scheme. The Tailwind pages have 3 and 26 failures in light mode (3 and 44 in dark), the hand-written CSS pages 31 and 49 (36 and 21 in dark): white text on bright buttons, small gray labels, avatar initials. One hand-written page also scrolls sideways on a phone. No page had accessibility errors from `npx tagbrush check`. All six support dark mode.
- **Design ambition: the honest caveat.** The Tailwind and hand-written pages look considerably more designed: a product mockup in the hero, icons, gradients, sparkline charts, colored status badges, an avatar menu. The TagBrush.css pages are clean and correct but plain by comparison, and they carry less copy (380 and 680 text tokens against 560 and 1,200). Part of the size difference is that the other agents simply built more.

What this means for TagBrush.css: the cost and correctness advantages are real and large, and the visual gap is the main thing standing between it and an agent's (or a person's) first choice. Closing that gap without classes is on the roadmap (chunk 21).
