<!-- Generated from llms.txt and llms/ by scripts/build.mjs. Do not edit directly. -->

# Chat and AI output

For Markdown a model writes, shown in a chat window.

- **Chat messages**: wrap each rendered message in an element with the scoped build's class, `<div class="tagbrush" data-density="compact">…</div>`, and load `https://cdn.jsdelivr.net/npm/tagbrush@2/tagbrush.scoped.min.css` instead of the full stylesheet, so only messages are styled and the app around them is untouched.
- **Transcripts**: a page that is only a conversation (a shared transcript or an export) is an ordinary page: load the full stylesheet as usual and put `data-density="compact"` on `<html>`.
- **Compact density**: `data-density="compact"` on any element (a message, or `<html>`) tightens spacing and makes headings smaller for a chat column. The last element of a compact message has no space below it, so a reply that is still streaming in doesn't jump.
- **Reasoning**: a model's reasoning, collapsed and muted: `<details data-reasoning><summary>Thought for 4 seconds</summary><p>…</p></details>`.
- **Citations**: `<p>Paris has 2.1 million residents.<sup><a href="#source-1">1</a></sup></p>`, with the sources at the end of the answer: `<footer><h2>Sources</h2><ol><li id="source-1"><a href="https://www.insee.fr/">INSEE, 2023 census</a></li></ol></footer>`.
- **Alerts**: callouts that Markdown tools write (GitHub alerts such as `> [!WARNING]`, MkDocs admonitions such as `!!! tip`) are colored by their kind. Nothing to add.
- **Narrow columns**: wide tables, code blocks, and KaTeX or MathJax block math scroll sideways instead of widening the column.
