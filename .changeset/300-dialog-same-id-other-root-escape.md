---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed <kbd>Escape</kbd> closing neither popup when two popups that mark each other, such as a [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover) and a non-modal [`Dialog`](https://ariakit.com/reference/dialog), are open together with an open [`Dialog`](https://ariakit.com/reference/dialog) in another root, such as a shadow root, that has the same `id` as one of them. This applies to all components built on [`Dialog`](https://ariakit.com/reference/dialog), such as [`Popover`](https://ariakit.com/reference/popover) and [`Menu`](https://ariakit.com/reference/menu).
