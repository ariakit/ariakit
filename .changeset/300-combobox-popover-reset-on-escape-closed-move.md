---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover) restoring a stale selected value with [`resetOnEscape`](https://ariakit.com/reference/combobox-popover#resetonescape) when an arrow key opened the popup from [`ComboboxSelect`](https://ariakit.com/reference/combobox-select), or when a character typed on the closed select changed the value before the popup opened.
