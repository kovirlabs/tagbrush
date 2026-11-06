import { defineConfig } from 'astro/config';

export default defineConfig({
  markdown: {
    // Two Shiki themes with defaultColor: false, so code blocks switch
    // between them with TagBrush.css's light and dark mode.
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
    },
  },
});
