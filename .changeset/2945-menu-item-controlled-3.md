---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Fixed [`CompositeItem`](https://ariakit.org/reference/composite-item) and associated components not receiving the [`disabled`](https://ariakit.org/reference/composite-item#disabled) prop when it's being used by a higher-level component such as [`MenuItemCheckbox`](https://ariakit.org/reference/menu-item-checkbox) or [`MenuItemRadio`](https://ariakit.org/reference/menu-item-radio).
