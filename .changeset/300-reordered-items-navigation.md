---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed keyboard navigation following the previous order after mounted [`CollectionItem`](https://ariakit.com/reference/collection-item) elements move in the DOM, such as when React reorders items with stable keys. This also applies to all components built on [`CollectionItem`](https://ariakit.com/reference/collection-item), such as [`CompositeItem`](https://ariakit.com/reference/composite-item) and [`ComboboxItem`](https://ariakit.com/reference/combobox-item).
