# TagBrush.css with Web Components, Lit, and Stencil

Page stylesheets don't reach inside a shadow root, so a component using Shadow DOM needs its own copy of the styles. Use **`tagbrush.shadow.css`** for that. It's the same library, but the page-level rules that normally target `html`, `body`, and `:root` target `:host` (the component element) instead.

```sh
npm install tagbrush
```

## Lit

With Vite (or any bundler that supports `?inline` CSS imports):

```js
import { LitElement, html, unsafeCSS } from 'lit';
import tagbrush from 'tagbrush/tagbrush.shadow.css?inline';

class ProfileCard extends LitElement {
  static styles = unsafeCSS(tagbrush);

  render() {
    return html`
      <h2>Ada Lovelace</h2>
      <p>First programmer.</p>
      <button>Follow</button>
    `;
  }
}
customElements.define('profile-card', ProfileCard);
```

Lit shares one stylesheet across every instance of the component.

## Vanilla custom elements

The simplest option is a `<link>` inside the shadow root:

```js
class ProfileCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).innerHTML = `
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tagbrush@2/tagbrush.shadow.min.css">
      <h2>Ada Lovelace</h2>
      <button>Follow</button>
    `;
  }
}
customElements.define('profile-card', ProfileCard);
```

To share one parsed stylesheet across many instances, use a constructable stylesheet:

```js
const sheet = new CSSStyleSheet();
sheet.replaceSync(await (await fetch('/tagbrush.shadow.css')).text());

// in each component's constructor:
this.shadowRoot.adoptedStyleSheets = [sheet];
```

## Stencil and others

Any tool that can attach a stylesheet to a shadow root works the same way: give it `tagbrush.shadow.css`.

## Theming

Variables are set on `:host`, so a page-wide `:root { --color-primary: … }` does **not** reach the component. Set them on the component element instead. Page CSS aimed at the host beats the defaults inside the shadow root:

```css
profile-card {
  --color-primary: #10b981;
}
```

Or set them inside the component's own styles with `:host { --color-primary: #10b981; }`.

Dark mode works the same as on a page: it follows the system setting, or you can force it with `<profile-card data-theme="dark">`.

The host element gets `display: block`. Override it from the page (`profile-card { display: inline-block; }`) or from inside with `:host { … }`.

## Slotted content

Content passed in through a `<slot>` lives in the page, not in the shadow root, so it's styled by the page's stylesheets. If you want TagBrush.css to style slotted content too, load the regular `tagbrush.css` on the page as well.
