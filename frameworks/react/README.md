# TagBrush.css with React (Vite)

```sh
npm install tagbrush
```

Import it once in your entry file:

```jsx
// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'tagbrush';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

Then write plain elements in your components, with no class names needed:

```jsx
export default function App() {
  return (
    <main className="container">
      <h1>Hello, world</h1>
      <button>Click me</button>
    </main>
  );
}
```

## Theming

Add variables to `src/index.css`:

```css
:root {
  --color-primary: #10b981;
}
```

CSS Modules, styled-components, Emotion, and inline styles are all unlayered, so they override TagBrush.css.

## Component libraries

If you use MUI, Chakra, Mantine, or similar, TagBrush.css also styles the native `<button>` and `<input>` elements inside those components. Use the scoped build and wrap only the parts you want styled:

```jsx
import 'tagbrush/scoped';

<article className="tagbrush">…</article>
```

## Gatsby

Import it in `gatsby-browser.js` (and `gatsby-ssr.js` if you want it in server-rendered HTML):

```js
// gatsby-browser.js
import 'tagbrush';
```
