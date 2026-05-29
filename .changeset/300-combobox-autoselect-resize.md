---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Combobox`](https://ariakit.com/reference/combobox) with [`autoSelect`](https://ariakit.com/reference/combobox#autoselect) losing typed characters when the popover was resized while typing, which could happen with a virtualized list on mobile devices where the keyboard's autocomplete bar repeatedly changes the available viewport height.
