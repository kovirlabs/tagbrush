<h1 align="center"><code>&lt;tagbrush&gt;</code></h1>

<p align="center"><strong>TagBrush.css</strong></p>

**A tiny, no-build CSS library that makes plain semantic HTML look clean and modern.**

One file, about 4 KB gzipped. No classes required. No PostCSS, bundler, or JavaScript. Dark mode built in. Theme it by overriding a few CSS variables, and your own CSS always wins. Works with any static site and drops straight into Astro.

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
- **Classless by default** – typography, lists, media, forms, tables, dialogs, and more are styled automatically.
- **Themeable** – colors, fonts, type scale, spacing, and radius are semantic CSS custom properties. Hover and focus colors derive from `--color-primary`, so one variable re-themes everything.
- **Easy to override** – everything lives in a `@layer`, so any CSS you write wins without `!important`.
- **Dark mode** – follows the system setting automatically, or force it per page or per element with `data-theme`.
- **Accessible** – visible keyboard focus rings, respects `prefers-reduced-motion`, and includes print styles.
- **Tiny and dependency-free** – about 4 KB gzipped (20 KB unminified, with comments).
- **Astro friendly** – import once in your layout and every page picks it up.

## What gets styled

| Category   | Elements                                                                 |
|------------|--------------------------------------------------------------------------|
| Typography | `h1`–`h6`, `p`, `a`, `strong`, `small`, `mark`, `abbr`, `sub`, `sup`, `hr`, `blockquote`, `code`, `pre`, `kbd`, `samp` |
| Lists      | `ul`, `ol` (including nested lists), `dl`, `dt`, `dd`                    |
| Media      | `img`, `picture`, `video`, `canvas`, `svg`, `iframe` (scale to fit), `figure`, `figcaption` |
| Structure  | `nav` (with `ul` rendered as a horizontal menu, `aria-current` highlighted), `header`, `main`, `footer` |
| Buttons    | `button`, `input[type=submit/button/reset]`, `.button`, `:disabled`, `aria-disabled` |
| Forms      | `fieldset`, `legend`, `label`, `textarea`, `select`, every text-like `input` type (including `date`, `time`, `search`, …), `checkbox`, `radio`, `range`, `color`, `file` |
| Form states | `:focus`, `:disabled`, `::placeholder`, `aria-invalid="true"` / `"false"`, `:user-invalid`, help text via `<small>` after a field |
| Tables     | `table`, `caption`, `thead`, `tbody`, `tfoot`, `th`, `td` (wrap in `<figure>` to scroll on small screens) |
| Interactive | `details`, `summary`, `dialog` (with `::backdrop`), `progress`, `meter` |

### Utility classes

TagBrush.css keeps classes to a minimum:

| Class        | What it does                                                        |
|--------------|---------------------------------------------------------------------|
| `.container` | Centers content with a max width (`--container-max-width`) and horizontal padding |
| `.button`    | Gives any element (usually an `<a>`) the button style               |
| `.secondary` | Neutral button variant (also applied to `type="reset"` buttons)     |
| `.outline`   | Transparent button with a primary-colored border                    |
| `.visually-hidden` | Hides content visually but keeps it available to screen readers |

## Customization

All design tokens live on `:root`. Override any of them in your own CSS:

```css
:root {
  --color-primary: #10b981;       /* emerald */
  --font-family-base: "Inter", sans-serif;
  --border-radius: 0.5rem;
}
```

Hover colors and focus rings are derived from `--color-primary` automatically. Set `--color-primary-hover` or `--focus-ring-color` only if you want something different.

### Your CSS always wins

TagBrush.css wraps everything in a cascade layer called `tagbrush`. CSS outside a layer always beats CSS inside one, whatever the specificity, so overriding is as simple as:

```css
button { border-radius: 999px; }   /* beats TagBrush.css, no !important needed */
```

Load order doesn't matter either. If you organize your own CSS into layers, declare the order once:

```css
@layer tagbrush, components, utilities;
```

### Dark mode

TagBrush.css follows the visitor's system setting out of the box. To force a scheme, set `data-theme` on `<html>` or on any element to theme just that part of the page:

```html
<html data-theme="dark">                  <!-- whole page -->
<section data-theme="light">…</section>   <!-- just this section -->
```

To turn dark mode off entirely: `:root { color-scheme: light; }`.

Color variables use [`light-dark()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark) so each carries both values. **When you override a color, give it both values too**, or one of the schemes will look wrong:

```css
:root {
  --color-background: light-dark(#fafaf9, #0c0a09);
  --color-text: light-dark(#1c1917, #e7e5e4);
}
```

### Custom button variants

Button variants only change a few private variables, so you can add your own in one line:

```css
.danger { --_btn-bg: var(--color-error); --_btn-bg-hover: color-mix(in srgb, var(--color-error), black 15%); }
```

`--_btn-bg`, `--_btn-bg-hover`, `--_btn-color`, and `--_btn-border` are available.

### Available variables

| Variable                | Default      | Used for                                  |
|-------------------------|--------------|-------------------------------------------|
| `--color-primary`       | `#3b82f6`    | Links, buttons, focus rings, checkboxes, progress bars |
| `--color-on-primary`    | `#ffffff`    | Text on primary buttons                   |
| `--color-primary-hover` | *derived*    | Link and button hover (primary + 15% black) |
| `--color-background`    | white / `#111827` | Page, input, and dialog backgrounds  |
| `--color-surface`       | `#f3f4f6` / `#1f2937` | Code, blockquotes, secondary buttons |
| `--color-text`          | `#1f2937` / `#f3f4f6` | Body text and headings          |
| `--color-text-muted`    | `#6b7280` / `#9ca3af` | Captions, help text, placeholders, footers |
| `--color-border`        | `#e5e7eb` / `#374151` | Inputs, tables, rules, details  |
| `--color-highlight`     | `#fef08a` / `#713f12` | `<mark>` background             |
| `--color-error`         | `#dc2626` / `#f87171` | Invalid fields and their help text |
| `--color-success`       | `#16a34a` / `#4ade80` | Fields marked `aria-invalid="false"` |
| `--focus-ring-color`    | *derived*    | Focus outlines (primary at 50% opacity)   |
| `--focus-ring-width`    | `3px`        | Focus outlines and input focus rings      |
| `--font-family-base`    | system stack | All text                                  |
| `--font-family-mono`    | system mono  | `code`, `pre`, `kbd`, `samp`              |
| `--font-size-base`      | `1rem`       | Body text, buttons, inputs                |
| `--font-size-sm`        | `0.875rem`   | `small`, captions, footers                |
| `--font-size-h1` … `--font-size-h6` | `2.25rem` – `1rem` | Heading sizes             |
| `--font-weight-heading` | `600`        | Headings                                  |
| `--line-height` / `--line-height-heading` | `1.6` / `1.2` | Body text / headings |
| `--spacing-xs` … `--spacing-xl` | `0.25rem` – `2rem` | Margins and padding throughout |
| `--container-max-width` | `1200px`     | `.container` width                        |
| `--container-padding`   | `1rem`       | `.container` side padding                 |
| `--border-radius`       | `0.375rem`   | Buttons, inputs, code, dialogs            |
| `--border-width`        | `1px`        | Inputs, buttons, table rules              |
| `--shadow` / `--shadow-lg` | soft shadows | Available for your components / dialogs |
| `--transition-duration` | `0.15s`      | Hover and focus transitions (`0s` with reduced motion) |

Where two defaults are shown, they are the light and dark values.

### Browser support

TagBrush.css uses modern CSS (`@layer`, `light-dark()`, `color-mix()`, `:has()`, `:where()`), supported by all evergreen browsers since 2024.

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

Astro's scoped component styles are unlayered, so they always override TagBrush.css too.

## Project files

| File         | Purpose                                         |
|--------------|-------------------------------------------------|
| `tagbrush.css`   | The library itself                              |
| `index.html` | Landing page and live demo, styled by TagBrush.css  |
| `AGENT.md`   | Design notes and development plan               |

## Contributing

Issues and pull requests are welcome. TagBrush.css aims to stay small and build-free, so changes should be plain CSS inside the `@layer tagbrush` block that styles standard HTML elements and reads from the theme variables. Check new rules in both light and dark mode. Open `index.html` in a browser to check your changes visually.

## License

Licensed under the [Apache License, Version 2.0](LICENSE).
