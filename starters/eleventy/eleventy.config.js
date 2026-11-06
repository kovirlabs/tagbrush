import syntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight';

export default function (eleventyConfig) {
  // Prism classes on code blocks; TagBrush.css colors them and follows dark mode.
  eleventyConfig.addPlugin(syntaxHighlight);

  eleventyConfig.addFilter('readableDate', (date) =>
    new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }));
  eleventyConfig.addFilter('isoDate', (date) => new Date(date).toISOString().slice(0, 10));
}
