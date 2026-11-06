# Agent evaluation

How well does an AI coding agent do with TagBrush.css when all it has is [`llms.txt`](../llms.txt)?

Each page in [`pages/`](pages/) was written by a separate agent that was given only `llms.txt` and one request below, and told not to look at anything else in the repository. The agents also reported anything the guide didn't cover; those reports drive changes to `llms.txt` and the stylesheet.

The tests (`agent-written pages` in `tests/tagbrush.spec.mjs`) check every page in `pages/` against the current `tagbrush.css`:

- no horizontal scrolling at phone and desktop widths;
- every piece of text meets WCAG AA contrast (4.5:1) in light and dark mode;
- only the classes `llms.txt` documents are used, so an agent that invents classes shows up;
- a `<style>` block, if any, only sets CSS variables (theming), never layout.

To add a case: give a fresh agent `llms.txt` and a new request, save its page in `pages/`, add the request here, and run the tests.

## Requests

All requests use the same instructions: read only `llms.txt`, write one self-contained HTML file using the CDN link, use realistic content, and follow the guide (semantic HTML, no invented classes, no layout CSS).

| Page | Request |
|---|---|
| `landing.html` | Build a landing page for "Lumen", a time-tracking app for freelancers. Include a hero with a call to action, a features section, a pricing section with three plans, testimonials, an FAQ, and a footer. |
| `signup.html` | Make a sign-up page for a community meetup: name, email, password with requirements shown, a select for experience level, interests as checkboxes, a newsletter toggle, a terms checkbox, and a submit button. Show what an error looks like on the email field. |
| `dashboard.html` | Build an analytics dashboard page for an online store: a sidebar with navigation, a top bar with the store name and a user menu, a row of key numbers (revenue, orders, conversion rate, average order value), a recent orders table with status, and a panel with top products. |
| `blog-post.html` | Write a blog post page titled "What I learned running a tiny SaaS for a year", with author and date, a lead image with caption, several sections with headings, a pull quote, a code example, a comparison table, a callout note, and a "related posts" list at the end. |
| `docs.html` | Create a documentation page for a CLI tool called "shipit": breadcrumbs, a sidebar table of contents, installation steps with code blocks, a table of command-line options, keyboard shortcuts, a warning callout, an FAQ accordion, and previous/next page links at the bottom. |
| `admin-users.html` | Build an admin page to manage users: a search box and filter above the table, a table of users (avatar initials, name, email, role, status, last active) with edit/delete actions per row, pagination, an "Invite user" button that opens a modal form, and a confirmation dialog for delete. Use our brand color #0f766e. |

## Findings

### Round 1 (November 2026)

Six agents, one page each. All pages used semantic HTML, documented classes only, and no layout CSS. The checks then found three bugs in TagBrush.css, and the agents' reports found gaps in the guide.

Fixed in TagBrush.css:

- A `.visually-hidden` label inside a scrolling table (a screen-reader-only column header) escaped the scroll area and widened the page on phones. Scrolling tables and figures now contain it.
- `<ins>` and `<del>` inside muted text (changes like "+12.4%" in a dashboard tile) fell below 4.5:1 on a card's surface. They now use full-contrast text.
- Previous/next links in a `<nav>` sat side by side. A `rel="next"` link now moves to the far end of the row.

Clarified in `llms.txt`: lists in any `<nav>` are horizontal; previous/next and pagination; callouts work anywhere in an article; single-form pages go in an `<article>`; `<select>` in a `role="group"`; `<mark>` for status labels and `<ins>`/`<del>` for changes.

Gaps that need new patterns (chunk 16): a sidebar layout (dashboard, docs), vertical navigation in a sidebar, stat tiles for key numbers, a page header with a title and action buttons, and a hero section. Also reported, and not planned yet: badge colors, a "featured" card, multi-column footers, a danger button, pull quotes, and avatars.
