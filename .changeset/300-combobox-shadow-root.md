---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

`Combobox` keyboard support in shadow roots

[`Combobox`](https://ariakit.com/reference/combobox) and [`ComboboxInput`](https://ariakit.com/reference/combobox-input) inside a shadow root now activate the first matching item when typing with [`autoSelect`](https://ariakit.com/reference/combobox#autoselect), so <kbd>Enter</kbd> submits that item instead of the typed text. [`ComboboxList`](https://ariakit.com/reference/combobox-list) and [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover) now return focus to the combobox so arrow keys can move the active item.

[`ComboboxSelect`](https://ariakit.com/reference/combobox-select) inside a shadow root now handles arrow keys and <kbd>Escape</kbd> while its popup is open. <kbd>Escape</kbd> also closes a popup that has a search input and stays in the shadow root.

The <kbd>Escape</kbd> fix applies to all components built on [`Dialog`](https://ariakit.com/reference/dialog) whose disclosure is in a shadow root, including [`Popover`](https://ariakit.com/reference/popover), [`Hovercard`](https://ariakit.com/reference/hovercard), [`Menu`](https://ariakit.com/reference/menu), [`Tooltip`](https://ariakit.com/reference/tooltip), [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover), and [`SelectPopover`](https://ariakit.com/reference/select-popover).
