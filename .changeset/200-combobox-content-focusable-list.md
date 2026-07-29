---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

`ComboboxContent` and focusable `ComboboxList`

Added `ComboboxContent` to `@ariakit/react-components` as the lower-level content primitive shared by `ComboboxList` and `ComboboxPopover`.

Made [`ComboboxList`](https://ariakit.com/reference/combobox-list) focusable. Tabbing into the list and pressing an Arrow, Home, End, Page Up, or Page Down key now moves focus to the first or last enabled item without replacing the combobox control as the store's base element.
