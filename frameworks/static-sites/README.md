# TagBrush.css with static site generators

No install needed. Add the CDN link to your base template's `<head>`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tagbrush@2/tagbrush.min.css">
```

To self-host, put `tagbrush.css` in the folder your generator copies as-is:

| Generator | Put the file in | Link it as |
|-----------|-----------------|------------|
| Eleventy | `css/tagbrush.css`, plus `eleventyConfig.addPassthroughCopy("css")` in `eleventy.config.js` | `/css/tagbrush.css` |
| Hugo | `static/css/tagbrush.css` | `{{ "css/tagbrush.css" | relURL }}` |
| Jekyll | `assets/css/tagbrush.css` | `{{ "/assets/css/tagbrush.css" | relative_url }}` |
| Plain HTML | next to your pages | `tagbrush.css` |

Markdown output (headings, lists, tables, code blocks, blockquotes) is plain semantic HTML, so it's styled with no extra work.

## Theming

Add a stylesheet after it, or a `<style>` block:

```html
<style>
  :root {
    --color-primary: #10b981;
  }
</style>
```
