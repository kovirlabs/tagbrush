# TagBrush.css with Angular

```sh
npm install tagbrush
```

Add it to the `styles` array in `angular.json`, before your own global stylesheet:

```json
{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "options": {
            "styles": [
              "node_modules/tagbrush/tagbrush.css",
              "src/styles.css"
            ]
          }
        }
      }
    }
  }
}
```

Restart `ng serve` after editing `angular.json`.

## Theming

```css
/* src/styles.css */
:root {
  --color-primary: #10b981;
}
```

Component styles that use Angular's default emulated encapsulation are unlayered, so they always override TagBrush.css.

## Components using `ViewEncapsulation.ShadowDom`

Global styles can't reach inside a shadow root. Give those components the Shadow DOM build:

```ts
@Component({
  selector: 'app-card',
  encapsulation: ViewEncapsulation.ShadowDom,
  styleUrls: ['../../../node_modules/tagbrush/tagbrush.shadow.css', './card.component.css'],
  template: `<h2>Card</h2><button>Save</button>`,
})
export class CardComponent {}
```

Adjust the relative path to `node_modules` for your component's folder. See the [Web Components guide](../web-components/README.md) for how theming works inside a shadow root.

## Angular Material

Angular Material buttons and form fields are native `<button>` and `<input>` elements, so TagBrush.css styles them too. Material's own styles are unlayered and win for every property they set, but the two can still mix. If you use Material, use the scoped build (`node_modules/tagbrush/tagbrush.scoped.css`) and put `class="tagbrush"` on the content you want styled.

## AngularJS (1.x)

AngularJS has no build pipeline to hook into, so link the file in `index.html`:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tagbrush@2/tagbrush.min.css">
```
