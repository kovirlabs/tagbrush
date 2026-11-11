<!-- Generated from llms.txt and llms/ by scripts/build.mjs. Do not edit directly. -->

# Content

Text, media, tables, and code, including Markdown output.

## Text

- **Headings and subtitles**: `<hgroup><h1>Title</h1><p>Subtitle</p></hgroup>` gives a heading a muted subtitle. Headings wrap in balanced lines.
- **Inline text**: `<mark>`, `<kbd>`, `<code>`, `<abbr title="…">`, `<del>`, `<ins>`, `<small>`, `<q>`, `<dfn>`, and `<output>` are all styled. `<s>` is muted, so `<s>$49</s> <strong>$29</strong>` reads as a sale price.
- **Callouts**: an `<aside>` anywhere inside an `<article>` (also between its sections) is a highlighted callout: `<article><aside><strong>Note:</strong> Back up first.</aside></article>`. Start it with a bold word to label it; `data-tone="warning"` (or `error`, `success`, `info`) colors it.
- **Quotes**: `<blockquote><p>…</p><footer>Author</footer></blockquote>`.
- **Pull quote**: a quote with a caption in a figure stands out at a larger size: `<figure><blockquote><p>The grant came through.</p></blockquote><figcaption>Ana Ruiz, Director</figcaption></figure>`.
- **Avatars**: an `<img>` in a `<figcaption>`, an article's `<footer>`, or an `<address>` is a round 2.5rem picture beside the name: `<figcaption><img src="ana.jpg" alt="">Ana Ruiz, Director</figcaption>`.
- **Addresses**: `<address>` for contact details; its links and an avatar are styled.

## Links

- **Document links**: a link to a document gets a small muted label saying what it is: `<a href="report.pdf">Annual report</a>` shows "PDF" (also DOC, XLS, CSV, ZIP), and a link with `download` gets an arrow. Buttons, nav links, and image links are left alone. Don't also write "(PDF)" in the link text.

## Media

- **Images**: `<figure><img src="…" alt="…"><figcaption>Caption</figcaption></figure>`. Images and video scale down to fit.
- **Video embeds**: an `<iframe>` without a `height` attribute fills the width at 16:9: `<iframe src="tour.html" title="Product tour"></iframe>`. One with a `height` keeps it.

## Tables and code

- **Tables**: plain `<table>` with `<thead>` and `<tbody>`. A table is as wide as its content, and a wide one scrolls inside itself with a shadow at the edge that has more. Wrap it in `<figure>` to fill the width. Zebra rows: `class="striped"`. Rows highlight under the pointer.
- **Numbers in tables**: a cell holding only a `<data>` value aligns right in tabular figures: `<table><tr><td>Staff</td><td><data value="48000">$48,000</data></td></tr></table>`.
- **Code**: `<pre><code>`. Highlighting classes from Prism, highlight.js, Shiki, Hugo, Jekyll, and Pandoc are colored automatically. Wide code scrolls with a shadow at the edge.
- **Accordion**: neighboring `<details><summary>Question</summary><p>Answer</p></details>` join into one group. Give them the same `name="…"` so only one opens at a time.

## Automatic

- **Motion**: dialogs and popovers fade in, pages of the same site cross-fade as you navigate, and hover effects only appear on devices that hover. All of it stops for readers who prefer reduced motion. Nothing to add.
