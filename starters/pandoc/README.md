# TagBrush.css with Pandoc

Turn any Markdown file into a styled web page.

## One command, no template

```sh
pandoc notes.md --standalone --css https://cdn.jsdelivr.net/npm/tagbrush@2/tagbrush.min.css -o notes.html
```

Passing `--css` also turns off Pandoc's built-in page styles, so TagBrush.css takes over. Add `--metadata title="My notes"` if the file has no title.

## With the template

[`template.html`](template.html) adds a title block (title, subtitle, author, date), an optional table of contents in a collapsible `<details>`, and keeps the text at a comfortable reading width:

```sh
curl -O https://raw.githubusercontent.com/kovirlabs/tagbrush/main/starters/pandoc/template.html
pandoc notes.md --standalone --template template.html --toc -o notes.html
```

With the one-liner, code blocks keep Pandoc's own highlighting colors. The template leaves those out, so TagBrush.css colors the code and it follows dark mode.

Footnotes, tables (including column alignment), task lists, and definition lists are all styled.
