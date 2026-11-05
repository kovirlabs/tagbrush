# Changelog

All notable changes to TagBrush.css are listed here. This project follows [Semantic Versioning](https://semver.org/): variable names and the selectors you can rely on only change in a major release.

## 1.0.1 (unreleased)

### Fixed
- Default colors now meet WCAG AA contrast (4.5:1) in light and dark mode. `--color-primary` is now `#2563eb` (was `#3b82f6`, 3.7:1 with white text), and the light `--color-text-muted` is now `#646b76` (was `#6b7280`, 4.4:1 on `--color-surface`). If you set your own colors, nothing changes for you.
- Links and `.outline` button text use a lighter version of the primary color in dark mode, so they stay readable on dark backgrounds. Setting `--color-link` still overrides this.
- Inline SVGs with `width`, `height`, and `viewBox` attributes keep their proportions when they shrink to fit a narrow container, instead of keeping their full height.

## 1.0.0 (2026-11-04)

First versioned release.

### Added
- `@layer tagbrush` cascade layer so your own CSS always wins.
- Automatic dark mode with `light-dark()` colors, plus `data-theme="light|dark"` on any element.
- Theme variables for colors, fonts, a full type scale, a single `--spacing` knob, container width, focus rings, shadows, and transitions.
- Component variables: `--button-padding`, `--button-radius`, `--button-font-weight`, `--input-padding`, `--input-radius`, `--card-padding`, `--card-radius`.
- `--font-family-heading`, `--color-heading`, `--color-link`, `--color-link-hover`, `--color-marker`, `--color-warning`.
- Classless styles for inline text (`mark`, `kbd`, `abbr`, `del`, `ins`, `s`, `dfn`, `sub`, `sup`, `small`, `output`), `hr`, `address`, `hgroup`, `dl`, `menu`, media, `figure`, `nav`, `search`, `article aside` callouts, `details`, `dialog`, `[popover]`, `progress`, `meter`, every input type, `optgroup`, multi-selects, validation states, wrapped labels, and help text.
- Layout helpers: `.grid`, `.card`, `[role="group"]`, `.striped` tables, `.visually-hidden`.
- Button variants `.secondary` and `.outline`.
- Reduced-motion and print styles.
- `tagbrush.min.css`, and a scoped build (`tagbrush.scoped.css`) that only styles inside `.tagbrush`.
- npm package, theme builder on the demo page, and cross-browser tests.
- Shadow DOM build (`tagbrush.shadow.css`, `tagbrush/shadow`) for Web Components, Lit, Stencil, and Angular `ViewEncapsulation.ShadowDom`.
- Setup guides in `frameworks/` for Astro, Next.js, React, React Router, Vue, Nuxt, Angular, SvelteKit, Solid, Web Components, Tailwind CSS, and static site generators.
