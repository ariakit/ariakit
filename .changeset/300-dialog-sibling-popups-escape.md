---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed <kbd>Escape</kbd> closing neither popup when a [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover) and a non-modal [`Dialog`](https://ariakit.com/reference/dialog) or a [`Tooltip`](https://ariakit.com/reference/tooltip) that isn't its React ancestor are open at the same time. This applies to all components built on [`Dialog`](https://ariakit.com/reference/dialog), such as [`Popover`](https://ariakit.com/reference/popover) and [`Menu`](https://ariakit.com/reference/menu).
