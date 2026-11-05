# TagBrush.css with Next.js

```sh
npm install tagbrush
```

## App Router

Import it in the root layout, next to your own global stylesheet:

```tsx
// app/layout.tsx
import 'tagbrush';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

## Pages Router

Global CSS must be imported in `pages/_app.tsx`:

```tsx
// pages/_app.tsx
import type { AppProps } from 'next/app';
import 'tagbrush';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
```

## Theming

Put overrides in `globals.css`:

```css
:root {
  --color-primary: #10b981;
}
```

Import order doesn't matter: `globals.css` and CSS Modules are unlayered, so they always beat TagBrush.css.

## Tailwind

`create-next-app` can set up Tailwind CSS for you. If your project uses it, remove `import 'tagbrush'` from the layout and import it from `globals.css` instead, as the [Tailwind guide](../tailwind/README.md) shows. Without that change, Tailwind's Preflight reset removes most of TagBrush.css's styling.
