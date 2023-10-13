---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Added `name` and `value` properties to non-native input elements rendered by [`Checkbox`](https://ariakit.org/reference/checkbox), [`Radio`](https://ariakit.org), [`MenuItemCheckbox`](https://ariakit.org/reference/menu-item-checkbox), and [`MenuItemRadio`](https://ariakit.org/reference/menu-item-radio).

It's now possible to access the `name` and `value` properties from the `event.target` element in the [`onChange`](https://ariakit.org/reference/checkbox#onchange) event handler.
