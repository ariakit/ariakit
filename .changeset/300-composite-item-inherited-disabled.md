---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`CompositeItem`](https://ariakit.com/reference/composite-item) so keyboard navigation honors [`accessibleWhenDisabled`](https://ariakit.com/reference/focusable#accessiblewhendisabled) values resolved by a composing [`Focusable`](https://ariakit.com/reference/focusable) above or below it. Disabled composite items with `focusable={false}` remain excluded from keyboard navigation even when `accessibleWhenDisabled` is set. This also applies to components built on [`CompositeItem`](https://ariakit.com/reference/composite-item), such as [`MenuItem`](https://ariakit.com/reference/menu-item) and [`ComboboxItem`](https://ariakit.com/reference/combobox-item).
