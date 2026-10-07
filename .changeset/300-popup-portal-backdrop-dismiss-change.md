---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Popups that change their portal, backdrop, or dismiss button while open

<kbd>Escape</kbd> now closes the popup that opened last when a non-modal [`Dialog`](https://ariakit.com/reference/dialog) that opened before it moves to a new portal node while both are open, such as when its [`portal`](https://ariakit.com/reference/dialog#portal) prop changes to `true`. The same applies when a non-modal [`Popover`](https://ariakit.com/reference/popover) that opened before it moves out of a portal, such as when its [`portal`](https://ariakit.com/reference/popover#portal) prop changes to `false`. Before, <kbd>Escape</kbd> closed that dialog or popover first.

A modal popup that is open during the move now also disables that dialog in its new portal node. It also disables that popover when the popover renders next to the modal popup after the move.

When a non-modal [`Dialog`](https://ariakit.com/reference/dialog) with a [`backdrop`](https://ariakit.com/reference/dialog#backdrop) moves out of a portal, a click on the backdrop now also closes a popup that opened after the dialog. A modal popup that renders next to the backdrop now disables it. The same applies when the [`backdrop`](https://ariakit.com/reference/dialog#backdrop) prop of an open non-modal [`Dialog`](https://ariakit.com/reference/dialog) changes from `false` to an element.

When the [`backdrop`](https://ariakit.com/reference/dialog#backdrop) prop of an open non-modal [`Dialog`](https://ariakit.com/reference/dialog) changes to another element type, a click on the new backdrop now closes the dialog, and the new backdrop gets the `z-index` of the dialog.

When a modal [`Dialog`](https://ariakit.com/reference/dialog) with no [`DialogDismiss`](https://ariakit.com/reference/dialog-dismiss) moves out of a portal, a modal popup that opened after the dialog and renders next to its visually hidden dismiss button now disables that button. The same applies when a modal [`Dialog`](https://ariakit.com/reference/dialog) loses its [`DialogDismiss`](https://ariakit.com/reference/dialog-dismiss) while a modal popup that opened after it is open, such as a nested [`Dialog`](https://ariakit.com/reference/dialog). Before, assistive technology could reach the button while that popup was open.

A modal [`Dialog`](https://ariakit.com/reference/dialog) no longer disables a modal [`Dialog`](https://ariakit.com/reference/dialog) that opened after it when its portal changes while both are open, such as when its [`portal`](https://ariakit.com/reference/dialog#portal) or [`portalElement`](https://ariakit.com/reference/dialog#portalelement) prop changes. Before, both dialogs were disabled, and the pointer and the keyboard couldn't reach either of them.

These changes apply to all components built on [`Dialog`](https://ariakit.com/reference/dialog), including [`Popover`](https://ariakit.com/reference/popover), [`Hovercard`](https://ariakit.com/reference/hovercard), [`Menu`](https://ariakit.com/reference/menu), [`Tooltip`](https://ariakit.com/reference/tooltip), [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover), and [`SelectPopover`](https://ariakit.com/reference/select-popover).
