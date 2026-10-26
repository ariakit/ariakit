---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

`data-instant` attribute on tooltips

The [`Tooltip`](https://ariakit.com/reference/tooltip) component now renders the [`data-instant`](https://ariakit.com/guide/styling#data-instant) attribute while it shows at once because another tooltip is active, and while it hides because another tooltip replaces it. A tooltip that shows after the normal delay doesn't have this attribute. This works across tooltips with separate stores.

Use it to skip the exit transition of the replaced tooltip, so the contents of the two tooltips don't overlap:

```css
.tooltip[data-instant]:not([data-open]) {
  transition: none;
}
```
