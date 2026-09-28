---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`ComboboxList`](https://ariakit.com/reference/combobox-list) inside a shadow root keeping focus instead of returning it to the combobox, which stopped the arrow keys from moving the active item. This also applies to [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover).
