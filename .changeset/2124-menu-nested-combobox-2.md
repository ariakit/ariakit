---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Automatic role on ComboboxGroup

The [`ComboboxGroup`](https://ariakit.org/reference/combobox-group) component now automatically assigns the `role` attribute as `rowgroup` if it's nestled within a [`ComboboxPopover`](https://ariakit.org/reference/combobox-popover) or [`ComboboxList`](https://ariakit.org/reference/combobox-list) wrapper that has the `role` attribute set to `grid`.
