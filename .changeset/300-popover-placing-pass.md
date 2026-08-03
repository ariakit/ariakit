---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Popups now wait for their whole positioning pass

Components that move focus or scroll into a popup, such as [`Menu`](https://ariakit.com/reference/menu), [`Select`](https://ariakit.com/reference/select) and [`Combobox`](https://ariakit.com/reference/combobox) with auto-select, now wait for every positioning pass rather than only the one that follows the popup being shown. Re-anchoring an open popup, by changing its [`placement`](https://ariakit.com/reference/popover-provider#placement) or anchor or by calling [`render`](https://ariakit.com/reference/use-popover-store#render) on its store, no longer lets them act on the position the popup is leaving.

A custom [`updatePosition`](https://ariakit.com/reference/popover#updateposition) that calls the supplied default function and then keeps working now owns the whole pass. Previously the popup counted itself as placed as soon as that inner call finished, so focus could move into it, or the page could scroll to it, while the callback was still deciding where it belongs.

```tsx
<Menu
  updatePosition={async ({ updatePosition }) => {
    await updatePosition();
    await measureContent();
    await updatePosition();
  }}
/>
```
