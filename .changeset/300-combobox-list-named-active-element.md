---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`ComboboxList`](https://ariakit.com/reference/combobox-list) and [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover), which builds on it, not moving focus back to the combobox when the list itself receives focus and the document contains a form named `activeElement`.
