---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover) rendering an invalid `listbox` role around a nested [`ComboboxList`](https://ariakit.com/reference/combobox-list) that carries a different popup role, and dropping its own role when an unrelated element with `role="listbox"` renders inside it.
