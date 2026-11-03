<h1 align="center"><code>&lt;tagbrush&gt;</code></h1>

<p align="center"><strong>TagBrush.css</strong></p>

**A tiny, no-build CSS library that makes plain semantic HTML look clean and modern.**

One ~6 KB file. No classes required. No PostCSS, bundler, or JavaScript. Theme it by overriding a few CSS variables. Works with any static site and drops straight into Astro.

👉 **See it in action:** open [`index.html`](index.html) in your browser for a live demo of every styled element, including a theming playground.

---

## Quick start

Add one line to your `<head>`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/kovirlabs/tagbrush@main/tagbrush.css">
```

Then write ordinary HTML:

```html
<main class="container">
  <h1>Hello, world</h1>
  <p>It already looks good.</p>
  <button>Click me</button>
</main>
```

> **Tip:** For production, pin a specific commit or tag instead of `@main` (e.g. `@<commit-sha>`) so updates never change your site unexpectedly. Or just [download `tagbrush.css`](tagbrush.css) and host it yourself.

## Features

- **No build step** – plain CSS you can link, copy, or import.
- **Classless by default** – headings, text, lists, buttons, forms, and tables are styled automatically.
- **Themeable** – colors, fonts, spacing, and radius are semantic CSS custom properties.
- **Tiny and dependency-free** – about 6 KB unminified.
- **Astro friendly** – import once in your layout and every page picks it up.

## What gets styled

| Category   | Elements                                                                 |
|------------|--------------------------------------------------------------------------|
| Typography | `h1`–`h6`, `p`, `a`, `blockquote`, `code`, `pre`                         |
| Lists      | `ul`, `ol` (including nested lists)                                      |
| Buttons    | `button`, `.button` (use on `<a>` to make a link look like a button), `:disabled` |
| Forms      | `fieldset`, `legend`, `label`, `textarea`, `select`, and `input` of type `text`, `email`, `password`, `number`, `search`, `tel`, `url` |
| Tables     | `table`, `thead`, `tbody`, `th`, `td`                                    |

### Utility classes

TagBrush.css keeps classes to a minimum:

| Class        | What it does                                                        |
|--------------|---------------------------------------------------------------------|
| `.container` | Centers content with a max width of `1200px` and horizontal padding |
| `.button`    | Gives any element (usually an `<a>`) the button style               |

## Customization

All design tokens live on `:root`. Override any of them in a stylesheet loaded **after** `tagbrush.css`:

```css
:root {
  --color-primary: #10b981;       /* emerald */
  --color-primary-hover: #059669;
  --font-family-base: "Inter", sans-serif;
  --border-radius: 0.5rem;
}
```

### Available variables

| Variable                | Default      | Used for                                  |
|-------------------------|--------------|-------------------------------------------|
| `--color-primary`       | `#3b82f6`    | Links, buttons, input focus border        |
| `--color-primary-hover` | `#2563eb`    | Link and button hover states              |
| `--color-background`    | `#ffffff`    | Page and input backgrounds                |
| `--color-surface`       | `#f3f4f6`    | Code, `pre`, and blockquote backgrounds   |
| `--color-text`          | `#1f2937`    | Body text and headings                    |
| `--color-text-muted`    | `#6b7280`    | Blockquote text                           |
| `--color-border`        | `#e5e7eb`    | Input, table, and blockquote borders      |
| `--color-error`         | `#ef4444`    | Reserved for error states                 |
| `--font-family-base`    | system stack | All text                                  |
| `--font-family-mono`    | system mono  | `code` and `pre`                          |
| `--spacing-xs` … `--spacing-xl` | `0.25rem` – `2rem` | Margins and padding throughout |
| `--border-radius`       | `0.375rem`   | Buttons, inputs, code blocks              |
| `--border-width`        | `1px`        | Inputs, buttons, table rules              |

## Using with Astro

Pick whichever approach fits your project.

**Option A – import it (bundled by Astro).** Save the file as `src/styles/tagbrush.css`, then import it in your layout:

```astro
---
// src/layouts/Layout.astro
import '../styles/tagbrush.css';
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
  </head>
  <body>
    <slot />
  </body>
</html>
```

**Option B – serve it as a static file.** Save the file as `public/tagbrush.css` and link it:

```astro
<link rel="stylesheet" href="/tagbrush.css" />
```

To customize the theme, add a global style block to the same layout:

```astro
<style is:global>
  :root {
    --color-primary: #10b981;
  }
</style>
```

## Project files

| File         | Purpose                                         |
|--------------|-------------------------------------------------|
| `tagbrush.css`   | The library itself                              |
| `index.html` | Landing page and live demo, styled by TagBrush.css  |
| `AGENT.md`   | Design notes and development plan               |

## Contributing

Issues and pull requests are welcome. TagBrush.css aims to stay small and build-free, so changes should be plain CSS that styles standard HTML elements and reads from the theme variables. Open `index.html` in a browser to check your changes visually.

## License

Licensed under the [Apache License, Version 2.0](LICENSE).
