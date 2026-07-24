---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed Combobox list labeling

Fixed [`ComboboxList`](https://ariakit.com/reference/combobox-list) and [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover) so they use the closest [`ComboboxHeading`](https://ariakit.com/reference/combobox-heading), [`ComboboxSelectLabel`](https://ariakit.com/reference/combobox-select-label), or [`ComboboxLabel`](https://ariakit.com/reference/combobox-label) as their accessible name unless they are explicitly named.

Thanks to [@georgekaran](https://github.com/georgekaran) for investigating the accessible-name gap and the separate label state needed to fix it.
