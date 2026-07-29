---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Added `ComboboxContent` to `@ariakit/react-components` as the lower-level content primitive shared by `ComboboxList` and `ComboboxPopover`.

Made [`ComboboxList`](https://ariakit.com/reference/combobox-list) a focusable composite container. Tabbing into the list now enables Arrow key navigation without replacing the combobox control as the store's base element.
