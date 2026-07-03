---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`CompositeItem`](https://ariakit.com/reference/composite-item) and components based on it, such as [`SelectItem`](https://ariakit.com/reference/select-item) and [`ComboboxItem`](https://ariakit.com/reference/combobox-item), leaving DOM focus stuck on the item with virtual focus enabled when the item received focus before the composite element was available, instead of redirecting focus to the composite element.
