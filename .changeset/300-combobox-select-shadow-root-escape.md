---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`ComboboxSelect`](https://ariakit.com/reference/combobox-select) inside a shadow root ignoring <kbd>Escape</kbd> while its popup was open, when the popup has a search input and stays in the shadow root. This applies to all components built on [`Dialog`](https://ariakit.com/reference/dialog) whose disclosure is in a shadow root, such as [`Popover`](https://ariakit.com/reference/popover) and [`SelectPopover`](https://ariakit.com/reference/select-popover).
