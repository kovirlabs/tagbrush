# TagBrush.css with Nuxt

```sh
npm install tagbrush
```

Add it to the global `css` array:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  css: ['tagbrush/tagbrush.css', '~/assets/css/main.css'],
});
```

That's all. Nuxt includes it in every page, including server-rendered HTML.

## Theming

```css
/* assets/css/main.css */
:root {
  --color-primary: #10b981;
}
```

Component `<style scoped>` blocks are unlayered, so they always override TagBrush.css.

If you use `@nuxtjs/tailwindcss` or `@nuxt/ui` (which includes Tailwind), see the [Tailwind guide](../tailwind/README.md).
