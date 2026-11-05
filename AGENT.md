# TagBrush.css Development Plan

## Overview

TagBrush.css is a lightweight, no-build CSS library designed for static sites and the Astro.js stack. It focuses on providing a clean, modern base style for standard HTML elements using a semantic CSS variable theming system, without requiring any PostCSS processing or build steps.

## Structure

The library is a single hand-written CSS file (`tagbrush.css`), plus `index.html` (demo page and theme builder). `scripts/build.mjs` generates `tagbrush.min.css`, `tagbrush.scoped.css` and `tagbrush.scoped.min.css` from it; those are committed so the GitHub CDN can serve them, and CI fails if they're stale. Never edit generated files directly.

The scoped build is a text transform: it wraps the layer in `@scope (.tagbrush)` and rewrites `:root`, `html`, `body` and `body >` selectors to `:scope`. The build throws if the patterns it expects are missing, so update `scripts/build.mjs` when changing those selectors.

`tests/tagbrush.spec.mjs` (Playwright) checks computed styles in Chromium, Firefox and WebKit, compares the min and scoped builds, and takes screenshot baselines (Chromium on macOS only; CI runs with `--ignore-snapshots`). When adding a feature, add a computed-style assertion for it.

### 1. Theming (CSS Variables)
All rules live inside `@layer tagbrush { ... }` so unlayered user CSS always overrides them. Selectors that would otherwise carry class/attribute/pseudo-class specificity are wrapped in `:where()`; plain element selectors are left as-is (a `:where()` rule loses to an element rule like `p` or `ul`, so only use it where no element rule competes).

Theme colors and design tokens are defined in the `:root` pseudo-class using CSS variables. Color tokens use `light-dark()` for automatic dark mode; `[data-theme="light|dark"]` sets `color-scheme` on any element. Derived values (`--color-primary-hover`, `--focus-ring-color`) are computed at the point of use with `var(--x, color-mix(...))` so overriding `--color-primary` alone, even on a nested element, updates them. This allows users to easily customize the look and feel of their site by overriding these variables in their own stylesheets or `<style>` blocks.

Variables follow a semantic naming convention:
- Colors: `--color-primary`, `--color-background`, `--color-text`, etc.
- Typography: `--font-family-base`, `--font-family-mono`
- Spacing: `--spacing-sm`, `--spacing-md`, etc.
- Borders: `--border-radius`, `--border-width`

### 2. Base Styles
Standard HTML elements are styled using the defined CSS variables. This includes:
- Global box-sizing and basic resets
- Typography (headings, paragraphs, links, inline elements, hr, blockquotes, code, kbd)
- Lists (ordered, unordered, description lists)
- Media (images, video, figure/figcaption)
- Page structure (nav, header, main, footer)
- Buttons, with `.secondary` / `.outline` variants built on private `--_btn-*` variables
- Forms (all input types, validation states, help text)
- Tables (caption, tfoot, scrollable inside `<figure>`)
- details/summary, dialog, progress, meter
- Reduced-motion and print styles

### 3. Utilities
`.container` constrains and centers content; `.visually-hidden` hides content visually while keeping it accessible.

## Usage in Astro.js

Using TagBrush.css in an Astro.js project is straightforward since it requires no build configuration.

1. **Include the CSS file:** Place `tagbrush.css` in your `public` directory or import it directly in your Astro components.
2. **Global Import:** To apply it globally, import it in your main layout component (e.g., `src/layouts/Layout.astro`):
   ```astro
   ---
   import '../styles/tagbrush.css';
   ---
   <!DOCTYPE html>
   <html>
       <head>
           <!-- ... -->
       </head>
       <body>
           <slot />
       </body>
   </html>
   ```
3. **Customization:** To customize the theme, simply define the CSS variables in a `<style is:global>` block in your layout or in a separate CSS file loaded after `tagbrush.css`:
   ```astro
   <style is:global>
       :root {
           --color-primary: #10b981; /* Change primary color to emerald green */
           --color-background: #fafafa;
           --font-family-base: 'Inter', sans-serif;
       }
   </style>
   ```

## Next Steps

- Refine the spacing and typography scales based on user feedback.
- Variables come in three tiers: global tokens (`--color-*`, `--spacing`, `--border-radius`), component tokens defined on :root from the globals (`--button-*`, `--input-*`, `--card-*`), and derived values computed at the point of use with `var(--x, fallback)` so nested overrides work. Keep new variables in the right tier.
