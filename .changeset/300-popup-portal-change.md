---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Popups that change their portal while open

<kbd>Escape</kbd> now closes the popup that opened last when a non-modal [`Dialog`](https://ariakit.com/reference/dialog) that opened before it moves to a new portal node while both are open, such as when its [`portal`](https://ariakit.com/reference/dialog#portal) prop changes to `true`. The same applies when a non-modal [`Popover`](https://ariakit.com/reference/popover) that opened before it moves out of a portal, such as when its [`portal`](https://ariakit.com/reference/popover#portal) prop changes to `false`. Before, <kbd>Escape</kbd> closed that dialog or popover first.

A modal popup that is open during the move now also disables that dialog in its new portal node. It also disables that popover when the popover renders next to the modal popup after the move.

When a non-modal [`Dialog`](https://ariakit.com/reference/dialog) with a [`backdrop`](https://ariakit.com/reference/dialog#backdrop) moves out of a portal, a click on the backdrop now also closes a popup that opened after the dialog. A modal popup that renders next to the backdrop now disables it.

These changes apply to all components built on [`Dialog`](https://ariakit.com/reference/dialog), including [`Popover`](https://ariakit.com/reference/popover), [`Hovercard`](https://ariakit.com/reference/hovercard), [`Menu`](https://ariakit.com/reference/menu), [`Tooltip`](https://ariakit.com/reference/tooltip), [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover), and [`SelectPopover`](https://ariakit.com/reference/select-popover).
