# TagBrush.css with SvelteKit (and Svelte)

```sh
npm install tagbrush
```

Import it in the root layout:

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import 'tagbrush';
  import '../app.css';

  let { children } = $props();
</script>

{@render children()}
```

For a plain Svelte + Vite app (no SvelteKit), import it in `src/main.js` instead.

## Theming

```css
/* src/app.css */
:root {
  --color-primary: #10b981;
}
```

Svelte component `<style>` blocks are unlayered, so they always override TagBrush.css. Use `:global(...)` only for rules that should reach outside the component.
