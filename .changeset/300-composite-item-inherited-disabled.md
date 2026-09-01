---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`CompositeItem`](https://ariakit.com/reference/composite-item) so it honors an inherited [`accessibleWhenDisabled`](https://ariakit.com/reference/focusable#accessiblewhendisabled) value during keyboard navigation. This also applies to components built on it, such as [`MenuItem`](https://ariakit.com/reference/menu-item) and [`ComboboxItem`](https://ariakit.com/reference/combobox-item).
