// All Markdown posts in src/pages/posts, newest first.
export const posts = Object.values(import.meta.glob('./pages/posts/*.md', { eager: true }))
  .sort((a, b) => new Date(b.frontmatter.date) - new Date(a.frontmatter.date));
