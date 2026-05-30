---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed `Combobox` dropping characters when the popover resizes while typing

The [`Combobox`](https://ariakit.com/reference/combobox) component with [`autoSelect`](https://ariakit.com/reference/combobox#autoselect) enabled no longer loses typed characters when the popover is resized as the user types.

This could happen with a virtualized list on mobile devices, where the keyboard's autocomplete bar repeatedly changes the available viewport height. Each resize re-rendered the list and re-applied the auto-selection, briefly moving focus away from the input and dropping keystrokes.
