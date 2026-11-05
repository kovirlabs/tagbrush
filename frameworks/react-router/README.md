# TagBrush.css with React Router v7 (and Remix)

```sh
npm install tagbrush
```

Import it in the root route so every page gets it:

```tsx
// app/root.tsx
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import 'tagbrush';
import './app.css';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
```

If you prefer the `links` export (for example in an older Remix project):

```tsx
import tagbrushHref from 'tagbrush/tagbrush.css?url';

export const links = () => [{ rel: 'stylesheet', href: tagbrushHref }];
```

## Theming

Add variables to `app/app.css`:

```css
:root {
  --color-primary: #10b981;
}
```

New React Router projects include Tailwind CSS. If yours does, import TagBrush.css from `app.css` instead, as the [Tailwind guide](../tailwind/README.md) shows.
