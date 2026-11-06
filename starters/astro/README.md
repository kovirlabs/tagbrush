# TagBrush.css Astro starter

A minimal [Astro](https://astro.build) site: a home page with the latest posts as cards, a posts list, and Markdown post pages at a comfortable reading width. The templates are plain HTML with no classes.

```sh
npx degit kovirlabs/tagbrush/starters/astro my-site
cd my-site
npm install
npm run dev
```

- TagBrush.css is imported once in `src/layouts/Base.astro`.
- `astro.config.mjs` gives Shiki a light and a dark theme with `defaultColor: false`, so code blocks switch with TagBrush.css's dark mode.
- Change the look with CSS variables in a global stylesheet, or build one with the [theme builder](https://kovirlabs.github.io/tagbrush/#theming).
