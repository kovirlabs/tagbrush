# Using TagBrush.css with frameworks

TagBrush.css is plain CSS, so the same file works in every framework. You don't need a framework-specific version. The only thing that changes is **where you import it**, and each guide below covers that.

| Framework | Guide |
|-----------|-------|
| Astro | [astro/](astro/README.md) |
| Next.js (App Router and Pages Router) | [nextjs/](nextjs/README.md) |
| React with Vite (and Gatsby) | [react/](react/README.md) |
| React Router v7 / Remix | [react-router/](react-router/README.md) |
| Vue with Vite | [vue/](vue/README.md) |
| Nuxt | [nuxt/](nuxt/README.md) |
| Angular (and AngularJS) | [angular/](angular/README.md) |
| SvelteKit / Svelte | [sveltekit/](sveltekit/README.md) |
| Solid / SolidStart | [solid/](solid/README.md) |
| Web Components, Lit, Stencil (Shadow DOM) | [web-components/](web-components/README.md) |
| Tailwind CSS (alongside any of the above) | [tailwind/](tailwind/README.md) |
| Eleventy, Hugo, Jekyll, plain HTML | [static-sites/](static-sites/README.md) |

## Which file should I use?

| File | Import | Use it when |
|------|--------|-------------|
| `tagbrush.css` | `tagbrush` | Most projects. Styles the whole page. |
| `tagbrush.min.css` | `tagbrush/min` | Same thing, minified (most bundlers minify for you anyway). |
| `tagbrush.scoped.css` | `tagbrush/scoped` | Only part of the page should be styled, or you're mixing TagBrush.css with a component library such as MUI, Vuetify, or Angular Material. |
| `tagbrush.shadow.css` | `tagbrush/shadow` | Styles inside a shadow root (Web Components, Lit, Stencil, Angular `ViewEncapsulation.ShadowDom`). Page-level stylesheets can't reach inside a shadow root. |

## Rules that hold in every framework

1. **Import it once, globally**, in the root layout or entry file. Don't import it in individual components.
2. **Your styles always win.** TagBrush.css lives in `@layer tagbrush`, and component styles (Vue `scoped`, Svelte, Astro, Angular emulated encapsulation, CSS Modules) are unlayered, so they override it whatever the import order or specificity.
3. **Theme with variables** in any global stylesheet:

   ```css
   :root {
     --color-primary: #10b981;
   }
   ```

4. **Tailwind needs a few extra lines**, and TagBrush.css should be imported from CSS rather than JavaScript. See the [Tailwind guide](tailwind/README.md).
