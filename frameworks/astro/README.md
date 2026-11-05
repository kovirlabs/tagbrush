# TagBrush.css with Astro

```sh
npm install tagbrush
```

Import it in the layout that every page uses:

```astro
---
// src/layouts/Layout.astro
import 'tagbrush';
---
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <slot />
  </body>
</html>
```

**Without npm:** save the file as `public/tagbrush.css` and add `<link rel="stylesheet" href="/tagbrush.css" />` to the `<head>`, or copy it to `src/styles/tagbrush.css` and `import '../styles/tagbrush.css'`.

## Theming

```astro
<style is:global>
  :root {
    --color-primary: #10b981;
  }
</style>
```

Astro's scoped `<style>` blocks are unlayered, so they always override TagBrush.css.
