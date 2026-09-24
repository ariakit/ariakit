---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

`Dialog` keeps its state when a close is prevented

When [`onClose`](https://ariakit.com/reference/dialog#onclose) prevents a close requested through the [`hide`](https://ariakit.com/reference/use-dialog-store#hide), [`setOpen`](https://ariakit.com/reference/use-dialog-store#setopen-1), or [`toggle`](https://ariakit.com/reference/use-dialog-store#toggle) functions of the dialog's store, [`Dialog`](https://ariakit.com/reference/dialog) no longer sets the [`open`](https://ariakit.com/reference/use-dialog-store#open) state to `false` and then back to `true`. This includes closes on <kbd>Escape</kbd>, on interactions outside the dialog, and from a disclosure button or an item that hides the popup on click. Popups that reset on close now keep their active item and stay positioned, so later keyboard moves still scroll the active item into view.

This applies to all components built on [`Dialog`](https://ariakit.com/reference/dialog), including [`Popover`](https://ariakit.com/reference/popover), [`Hovercard`](https://ariakit.com/reference/hovercard), [`Menu`](https://ariakit.com/reference/menu), [`Tooltip`](https://ariakit.com/reference/tooltip), [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover), and [`SelectPopover`](https://ariakit.com/reference/select-popover).

For these close requests, [`onClose`](https://ariakit.com/reference/dialog#onclose) now runs before the [`open`](https://ariakit.com/reference/use-dialog-store#open) state changes. Call `event.preventDefault()` to keep the dialog open, since reopening it from [`onClose`](https://ariakit.com/reference/dialog#onclose) no longer has any effect.
