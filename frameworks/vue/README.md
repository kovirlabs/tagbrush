# TagBrush.css with Vue (Vite)

```sh
npm install tagbrush
```

Import it once in your entry file:

```js
// src/main.js
import { createApp } from 'vue';
import 'tagbrush';
import './style.css';
import App from './App.vue';

createApp(App).mount('#app');
```

## Theming

Add variables to `src/style.css`:

```css
:root {
  --color-primary: #10b981;
}
```

Vue's `<style scoped>` blocks are unlayered, so they always override TagBrush.css:

```vue
<style scoped>
button {
  border-radius: 999px; /* wins over TagBrush.css */
}
</style>
```

## Component libraries

With Vuetify, PrimeVue, Element Plus, or similar, use the scoped build so TagBrush.css only styles content inside `.tagbrush`:

```js
import 'tagbrush/scoped';
```

```vue
<article class="tagbrush">…</article>
```
