---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Composite separators honor explicit orientation

Fixed [`CompositeSeparator`](https://ariakit.com/reference/composite-separator) to honor an explicit `orientation` prop instead of always using the composite store-derived default. This also fixes components built on it, including [`ToolbarSeparator`](https://ariakit.com/reference/toolbar-separator), [`MenuSeparator`](https://ariakit.com/reference/menu-separator), [`SelectSeparator`](https://ariakit.com/reference/select-separator), and [`ComboboxSeparator`](https://ariakit.com/reference/combobox-separator).
