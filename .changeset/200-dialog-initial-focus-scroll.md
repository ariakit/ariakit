---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Changed [`Dialog`](https://ariakit.com/reference/dialog) to scroll its initially focused element into view by the shortest distance that makes it visible, rather than centering it, which is visible in [`ComboboxSelect`](https://ariakit.com/reference/combobox-select) and [`SelectItem`](https://ariakit.com/reference/select-item) where a selected value below the fold now rests against the edge of its list rather than near the middle.
