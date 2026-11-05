# TagBrush.css with Tailwind CSS

TagBrush.css and Tailwind work well together: TagBrush.css gives plain elements good defaults, and Tailwind utilities adjust them. Without one setup step, though, Tailwind's Preflight reset wipes out TagBrush.css's headings, lists, and form styles.

## Tailwind v4

Put TagBrush.css's layer between Tailwind's `base` (Preflight) and `utilities` layers by declaring the layer order **before** importing Tailwind:

```css
/* app.css (or globals.css) */
@layer theme, base, tagbrush, components, utilities;

@import "tailwindcss";
@import "tagbrush";
```

The cascade then runs:

1. `base`: Tailwind's Preflight reset
2. `tagbrush`: TagBrush.css element styles, which override Preflight
3. `components`, `utilities`: Tailwind classes, which override TagBrush.css
4. Your unlayered CSS, which overrides everything

So `<button>` looks like a TagBrush.css button, and `<button class="rounded-full">` is still rounded.

Preflight also strips two browser defaults that TagBrush.css leaves alone: list bullets and the centering of `<dialog>` and `[popover]`. Add this after the imports to restore them:

```css
@layer base {
  ol, ul, menu { list-style: revert; }
  dialog, [popover] { margin: revert; }
}
```

`revert` restores the browser default, and because the rule sits in `base`, TagBrush.css and Tailwind classes such as `list-none` still override it.

Import TagBrush.css from this CSS file, as shown, rather than from JavaScript. Browsers order layers by where each name first appears. If a JavaScript `import 'tagbrush'` loads before this file, the `tagbrush` layer gets declared first and ends up *below* Preflight.

## Tailwind v3

Tailwind v3 doesn't output real CSS cascade layers, so its Preflight is unlayered and always beats TagBrush.css. Turn Preflight off and let TagBrush.css act as the reset:

```js
// tailwind.config.js
module.exports = {
  corePlugins: {
    preflight: false,
  },
};
```

Tailwind utilities are unlayered in v3 too, so they still override TagBrush.css.

## Sharing colors

To use TagBrush.css colors in Tailwind classes, map them to new theme names (v4):

```css
@theme inline {
  --color-brand: var(--color-primary);
  --color-muted: var(--color-text-muted);
}
```

Classes like `bg-brand` and `text-muted` then follow your TagBrush.css theme, dark mode included. Use new names such as `brand` rather than `primary`, because `--color-primary: var(--color-primary)` would refer to itself.
