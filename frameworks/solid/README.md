# TagBrush.css with Solid (and SolidStart)

```sh
npm install tagbrush
```

**Solid with Vite:** import it in the entry file.

```jsx
// src/index.jsx
import { render } from 'solid-js/web';
import 'tagbrush';
import './index.css';
import App from './App';

render(() => <App />, document.getElementById('root'));
```

**SolidStart:** import it in `src/app.tsx`.

```tsx
// src/app.tsx
import { Router } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start/router';
import 'tagbrush';
import './app.css';

export default function App() {
  return <Router><FileRoutes /></Router>;
}
```

## Theming

```css
:root {
  --color-primary: #10b981;
}
```
