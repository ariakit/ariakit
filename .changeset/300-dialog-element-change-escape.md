---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed <kbd>Escape</kbd> closing a non-modal [`Dialog`](https://ariakit.com/reference/dialog) before a [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover) that opened after it when React replaces the dialog element while both are open. This applies to all components built on [`Dialog`](https://ariakit.com/reference/dialog), such as [`Popover`](https://ariakit.com/reference/popover) and [`Menu`](https://ariakit.com/reference/menu).
