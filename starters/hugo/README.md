# TagBrush.css Hugo starter

A minimal [Hugo](https://gohugo.io) site: a home page with the latest posts as cards, a posts list, and post pages at a comfortable reading width. The templates are plain HTML with no classes.

```sh
npx degit kovirlabs/tagbrush/starters/hugo my-site
cd my-site
hugo server
```

- `hugo.toml` sets `markup.highlight.noClasses = false`, so code blocks get TagBrush.css's colors and switch with dark mode.
- Change the look with CSS variables in a `<style>` block in `layouts/_default/baseof.html`, or build one with the [theme builder](https://kovirlabs.github.io/tagbrush/#theming).
