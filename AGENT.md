# TagBrush.css Development Plan

## Overview

TagBrush.css is a lightweight, no-build CSS library designed for static sites and the Astro.js stack. It focuses on providing a clean, modern base style for standard HTML elements using a semantic CSS variable theming system, without requiring any PostCSS processing or build steps.

## Structure

The library consists of a single CSS file (`tagbrush.css`) and an example HTML file (`index.html`) to demonstrate usage.

### 1. Theming (CSS Variables)
Theme colors and design tokens are defined in the `:root` pseudo-class using CSS variables. This allows users to easily customize the look and feel of their site by overriding these variables in their own stylesheets or `<style>` blocks.

Variables follow a semantic naming convention:
- Colors: `--color-primary`, `--color-background`, `--color-text`, etc.
- Typography: `--font-family-base`, `--font-family-mono`
- Spacing: `--spacing-sm`, `--spacing-md`, etc.
- Borders: `--border-radius`, `--border-width`

### 2. Base Styles
Standard HTML elements are styled using the defined CSS variables. This includes:
- Global box-sizing and basic resets
- Typography (headings, paragraphs, links, blockquotes, code)
- Lists (ordered and unordered)
- Buttons
- Forms (inputs, textareas, selects, labels)
- Tables

### 3. Utilities
A `.container` class is provided to constrain the maximum width of the content and center it on the page.

## Usage in Astro.js

Using TagBrush.css in an Astro.js project is straightforward since it requires no build configuration.

1. **Include the CSS file:** Place `tagbrush.css` in your `public` directory or import it directly in your Astro components.
2. **Global Import:** To apply it globally, import it in your main layout component (e.g., `src/layouts/Layout.astro`):
   ```astro
   ---
   import '../styles/tagbrush.css';
   ---
   <!DOCTYPE html>
   <html>
       <head>
           <!-- ... -->
       </head>
       <body>
           <slot />
       </body>
   </html>
   ```
3. **Customization:** To customize the theme, simply define the CSS variables in a `<style is:global>` block in your layout or in a separate CSS file loaded after `tagbrush.css`:
   ```astro
   <style is:global>
       :root {
           --color-primary: #10b981; /* Change primary color to emerald green */
           --color-background: #fafafa;
           --font-family-base: 'Inter', sans-serif;
       }
   </style>
   ```

## Next Steps

- Expand the set of styled elements if necessary (e.g., specific form states, dialogs).
- Refine the spacing and typography scales based on user feedback.
