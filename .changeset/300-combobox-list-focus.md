---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`ComboboxList`](https://ariakit.com/reference/combobox-list) to render with `tabIndex={-1}` and move focus back to the combobox control when the list receives focus, preventing unintended Tab stops and focus loops.
