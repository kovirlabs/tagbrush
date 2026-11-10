<!-- Generated from llms.txt and llms/ by scripts/build.mjs. Do not edit directly. -->

# Pages and landing pages

The page frame, navigation, heroes, sections, and cards. Every pattern here comes from plain HTML; none needs a class except the button classes.

## Page frame

- **Page landmarks**: `<header>`, `<main>`, and `<footer>` as direct children of `<body>`. Their content is centered at 1200px (`--container-max-width`) while their backgrounds reach the edges, and the footer sits at the bottom of a short page. A class-free wrapper around them (`<div id="root">`, `<app-root>`) counts as the page too.
- **Reading width**: a `<main>` holding a single `<article>` (a blog post, a docs page) is kept at a 70-character reading width (`--reading-width`). A page with no `<main>` at all (Markdown output) is centered at reading width as a whole.
- **Skip link**: a link to an id, first in `<body>`, stays out of sight until it's focused: `<body><a href="#main">Skip to content</a><header>…</header><main id="main">…</main></body>`. Only the first child of `<body>` is treated this way.
- **Your own layout**: `<body data-layout="full">` turns the page layout off. On one landmark (`<header data-layout="full">`) it lets just that one go edge to edge.

## Navigation

- **Top bar**: `<header><nav><strong>Site name</strong><ul><li><a href="/" aria-current="page">Home</a></li><li><a href="/about">About</a></li></ul></nav></header>`. Lists inside any `<nav>` are horizontal rows (top bar, footer links, pagination), except inside an `<aside>`, where they're vertical. `aria-current="page"` marks the current page. Put the site name in `<strong>` or a link with a logo `<img>`.
- **Phone menu**: put the links in a popover inside the header's `<nav>`, after a button that opens it: `<nav><strong>Site</strong><button popovertarget="menu" aria-label="Menu">☰</button><div popover id="menu"><ul><li><a href="/about">About</a></li></ul></div></nav>`. Wide screens show the links in the bar and hide the button; phones show the button, which opens the links as a panel under the bar. No JavaScript. Only a popover that is a direct child of the page header's `<nav>` works this way.
- **Dropdown menu**: a `<details>` in a list in the page header's nav: `<li><details><summary>Services</summary><ul><li><a href="/grants">Grant writing</a></li><li><a href="/coaching">Coaching</a></li></ul></details></li>`. It opens below its label (toward the left for the last item), and in the phone menu panel it opens in place. No JavaScript. A `<details>` anywhere else stays an ordinary disclosure.
- **User menu**: a button in the header nav that opens a popover holding a nav: `<li><button class="outline" popovertarget="account">Maya</button></li>` and `<div popover id="account"><nav aria-label="Account"><ul><li><a href="/profile">Profile</a></li><li><a href="/logout">Sign out</a></li></ul></nav></div>`. A menu in a popover is a vertical list.
- **Pagination**: `<nav aria-label="Pagination"><ul><li><a rel="prev" href="/page/1">← Previous</a></li><li><a rel="next" href="/page/3">Next →</a></li></ul></nav>`. The `rel="next"` link sits at the far end of the row. Add numbered page links between them if needed.
- **Breadcrumbs**: `<nav aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="/docs">Docs</a></li><li><a aria-current="page">Install</a></li></ol></nav>`. Separators are added between items.
- **Footer columns**: a page footer with two or more `<nav>`s, each a heading and a list, lays them out as columns, and a last paragraph spans the width: `<footer><p>About the site</p><nav aria-label="Product"><h2>Product</h2><ul><li><a href="/pricing">Pricing</a></li></ul></nav><nav aria-label="Company"><h2>Company</h2><ul><li><a href="/about">About</a></li></ul></nav><p>© 2026 Acme</p></footer>`. A footer with one nav or none is muted, small text.

## Heroes

- **Hero**: an `<hgroup>` in the page header, after the `<nav>`, becomes a large, centered hero on a soft tint of the primary color: `<header><nav>…</nav><hgroup><h1>Big promise</h1><p>Supporting line</p></hgroup><div role="group"><a class="button" href="/signup">Start free</a><a class="button outline" href="/tour">Take the tour</a></div></header>`. `--hero-background: none` turns the tint off. An `<hgroup>` inside `<main>` is an ordinary heading with a subtitle, not a hero.
- **Hero picture**: a `<figure>`, `<img>`, `<picture>` or `<svg>` after the hero's buttons sits beside the text on wide screens and below it on phones, and the hero text aligns to the start.
- **Photo hero**: an `<img>` first in the page header, before the `<nav>`, fills the header behind a dark wash of the primary color, and the header's text turns light: `<header><img src="team.jpg" alt=""><nav>…</nav><hgroup><h1>…</h1><p>…</p></hgroup></header>`. Text stays at 4.5:1 or better even over a white photo. Use `alt=""` when the photo is decoration.

## Sections

- **Full-width bands**: in `<main data-layout="full">`, each `<section>` (and a `<header>`) spans the page with its content centered in the page column, so a band can have its own background: `<main data-layout="full"><section>…</section><section data-theme="dark">…</section></main>`. `data-theme="dark"` gives a dark band; `data-theme="light"` a light one. Sections touch each other, with no gap between bands.
- **Label above a heading**: a `<p>` before the heading in an `<hgroup>` is a small uppercase label in the link color: `<hgroup><p>Pricing</p><h2>Simple plans</h2></hgroup>`. A `<p>` after the heading is a muted subtitle.
- **Steps**: an `<ol>` whose items each start with a heading is a numbered timeline: `<ol><li><h3>Plan</h3><p>Tell us what you need.</p></li><li><h3>Build</h3><p>We make it.</p></li></ol>`. The numbers follow the list's own order (`start` works). An `<ol>` whose items start with text stays an ordinary numbered list.
- **Picture beside text**: a `<section>` holding just a `<figure>` and a `<div>` puts them side by side, in that order, and stacks them on phones: `<section><figure><img src="office.jpg" alt="Our office"></figure><div><h2>About us</h2><p>A small team in Portland.</p></div></section>`. Put the `<figure>` last for the picture on the right. A section with a heading and a figure (a chart under its title) stays stacked.
- **Logos**: a `<ul>` holding only images, in a section, header, or footer, is a centered, wrapping row: `<section><h2>Trusted by</h2><ul><li><img src="acme.svg" alt="Acme" height="40"></li><li><img src="globex.svg" alt="Globex" height="40"></li></ul></section>`. Set each logo's size with `height`. Wrap any text beside an image in an element (a list item with an image and bare text counts as a logo, since CSS can't see bare text).
- **Single-form page**: a page that is one form (sign-up, contact, settings): put the `<form>` inside an `<article>` in `<main>` for a narrow, centered column.

## Cards

- **Card grid**: two or more `<article>`s in a `<section>` become a responsive grid of cards: `<section><h2>Features</h2><article><h3>Fast</h3><p>…</p></article><article><h3>Private</h3><p>…</p></article></section>`. Only headings, `hgroup`, `p`, `header`, and `footer` may sit beside the articles; anything else turns the grid off. Two or three cards fill the row.
- **Card icon**: an icon `<svg>` (without `width`/`height`) first in a card sits on a tinted tile: `<article><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="9"/></svg><h3>Fast</h3><p>…</p></article>`. `data-tone` on the svg picks another color.
- **Card picture**: an `<img>` first in a card runs to its edges at 16:10.
- **Card buttons**: a last `<footer>`, `<div role="group">`, or paragraph of buttons sits at the bottom of the card, so buttons line up across a row of cards of different heights.
- **Clickable card**: a card whose heading holds its only link, with no other link or control, is a link all over, with hover and focus on the card: `<article><h3><a href="/posts/one">First post</a></h3><p>Summary</p></article>`. A card with a button or a second link stays as it is, so each control still works.
- **Featured card**: in a row of cards, the one whose button is solid while the others use `class="button outline"` gets a primary-colored border and a lift, as for a recommended plan. If every button is the same kind, no card is featured.
- **Testimonial**: a `<blockquote>` in a card is the card's text rather than a box: `<article><blockquote><p>They made it easy.</p></blockquote><footer><img src="ana.jpg" alt="">Ana Ruiz, Director</footer></article>`. An `<img>` in the footer is a round avatar.
- **Post list**: a `<ul>` of `<li><article>` items is a grid of cards too: `<ul><li><article><h3><a href="/posts/one">First post</a></h3><p>Summary</p></article></li></ul>`.
