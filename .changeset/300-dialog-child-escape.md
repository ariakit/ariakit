---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Dialog`](https://ariakit.com/reference/dialog) and components that inherit its default Escape handling, such as [`Popover`](https://ariakit.com/reference/popover) and [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover), so descendants can call `event.stopPropagation()` on Escape without hiding the enclosing component. Thanks to [@boaz-wiz](https://github.com/boaz-wiz).
