---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Combobox`](https://ariakit.com/reference/combobox) with [`autoSelect`](https://ariakit.com/reference/combobox#autoselect) keeping the previously active option highlighted for one frame after the filtered list changes. The same fix applies to all components built on [`CollectionItem`](https://ariakit.com/reference/collection-item), such as [`SelectItem`](https://ariakit.com/reference/select-item) and [`MenuItem`](https://ariakit.com/reference/menu-item). Thanks to [@ItaiYosephi](https://github.com/ItaiYosephi).
