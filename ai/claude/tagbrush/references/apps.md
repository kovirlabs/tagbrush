<!-- Generated from llms.txt and llms/ by scripts/build.mjs. Do not edit directly. -->

# Apps, dashboards, and docs

Layouts and components for pages people operate rather than read top to bottom.

## Layout

- **Sidebar layout**: an `<aside>` next to `<main>` becomes a sidebar column (stacked on phones), and `<main>` uses the full width: `<body><header>…</header><aside><nav aria-label="Sections"><ul><li><a href="/" aria-current="page">Dashboard</a></li><li><a href="/orders">Orders</a></li></ul></nav></aside><main>…</main><footer>…</footer></body>`. Navigation in an aside is a vertical list with the current page highlighted. Put the `<aside>` before the `<header>` for a full-height sidebar with the header as a top bar beside it.
- **Docs contents**: `<main><aside><nav aria-label="On this page"><ul><li><a href="#install">Install</a></li></ul></nav></aside><article>…</article></main>`. The aside stays in view beside the article, which keeps its reading width. An aside whose content is all `hidden` (such as TagAction's `<nav data-tag-toc hidden>` before it's filled) takes no column.
- **Title with actions**: `<header><h1>Users</h1><button>Invite user</button></header>` inside `<main>`, an `<article>`, or a `<section>` puts the buttons on the same row as the heading.
- **Search and filters**: `<search><input type="search" aria-label="Search users"><select aria-label="Role"><option>All roles</option></select><button>Filter</button></search>` lays the fields out in a row above a list or table.

## Data

- **Stat tiles**: a `<dl>` whose items are wrapped in `<div>`s becomes a row of tiles: `<dl><div><dt>Revenue</dt><dd>$84,312</dd><dd><ins>+12%</ins> vs. last month</dd></div><div><dt>Orders</dt><dd>1,148</dd></div></dl>`. A plain `<dl>` stays a list.
- **Status badges**: `<mark data-tone="success">Paid</mark>` is a tinted pill whose text stays readable in both schemes. Tones: `success`, `warning`, `error`, `info`, `neutral`, or any color with `style="--tone: #db2777"`. A plain `<mark>` is a highlight.
- **Changes**: `<ins>+12%</ins>` and `<del>−3%</del>` for changes up or down. In a stat tile they are green and red text after ▲ and ▼; elsewhere they stay highlighted edit marks.
- **Progress and meter**: `<progress value="40" max="100">`; a meter turns green, amber, or red from its attributes: `<meter value="0.7" low="0.5" high="0.8" optimum="0.2">`.
- **Loading**: `aria-busy="true"` on a button or any element shows a spinner.

## Overlays

- **Modal**: `<dialog><form method="dialog"><header><h2>Delete user?</h2><button aria-label="Close">✕</button></header><p>This can't be undone.</p><footer><button class="secondary" value="cancel">Cancel</button><button value="delete" data-tone="error">Delete</button></footer></form></dialog>`, opened with `dialog.showModal()`. The header puts the title and close button on one row; footer buttons align right. It fades in and out, and the page behind it doesn't scroll or shift while it's open.
- **Tabs**: `<div role="tablist" aria-label="Install with"><button role="tab" aria-controls="npm" aria-selected="true">npm</button><button role="tab" aria-controls="cdn">CDN</button></div><section id="npm" role="tabpanel">…</section><section id="cdn" role="tabpanel">…</section>`. The tabs are a row with the selected one underlined. TagAction shows one panel at a time and adds the arrow keys; without it every panel shows, one after another.
- **Popover**: `<button popovertarget="tip">?</button><div popover id="tip">…</div>`. It fades in and out.

## Buttons and icons

- **Buttons**: `<button>`. Secondary: `class="secondary"`. Outline: `class="outline"`. A link styled as a button: `<a class="button" href="…">`. These are the only classes buttons need.
- **Destructive button**: `data-tone` colors a button: `<button data-tone="error">Delete</button>` is solid red, `<button class="outline" data-tone="error">Remove</button>` red-bordered. Use it for the action that destroys something, above all in a confirm dialog: `<footer><button value="cancel" class="secondary">Cancel</button><button value="delete" data-tone="error">Delete</button></footer>`. `success`, `warning`, `info`, `neutral` and `style="--tone: …"` work too; the fill darkens as far as white text needs.
- **Expand buttons**: a `<button aria-expanded="false" aria-controls="menu">Account</button>` shows a chevron after its label, pointing up while `aria-expanded="true"`. TagAction's dropdown buttons get it. Buttons without `aria-expanded` (and links styled as buttons) are left alone; the browser's own popover state doesn't count, so a phone-menu `popovertarget` button stays plain.
- **Toggle buttons**: `<button aria-pressed="false">Bold</button>` is a toggle; with `aria-pressed="true"` it looks held down (a solid button darkens with an inset shadow; an `outline` or `secondary` one fills with a tint). TagAction's Show/Hide and theme buttons use it. Update the attribute yourself (or with TagAction) when it changes.
- **Button row**: wrap buttons, or an input with a button (a search bar), in `<div role="group">`. Inputs and `<select>`s in the group share the row.
- **Icons**: an inline `<svg viewBox="0 0 24 24" aria-hidden="true">` without `width`/`height` inside a button, link, heading, label, list item, table cell, or `<mark>` is sized to the text and lined up with it. Give the SVG its own `fill`/`stroke` attributes (for example `fill="none" stroke="currentColor"`).
