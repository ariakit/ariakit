---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Reliable `Escape` handling in popups

Pressing <kbd>Escape</kbd> now closes a nested [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover) without also closing its parent [`Dialog`](https://ariakit.com/reference/dialog) or an unrelated dialog. This also works when React renders into `document`, as in the Next.js App Router.

When a [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover) and a non-modal [`Dialog`](https://ariakit.com/reference/dialog) or a [`Tooltip`](https://ariakit.com/reference/tooltip) outside its React ancestry are open together, <kbd>Escape</kbd> now closes them in the correct order. This order stays correct when React replaces an open dialog's element or when an open dialog in another root, such as a shadow root, has the same `id`.

The [`hideOnEscape`](https://ariakit.com/reference/dialog#hideonescape) and [`onClose`](https://ariakit.com/reference/dialog#onclose) callbacks no longer run more than once for one <kbd>Escape</kbd>, including when a combobox or select has an active item or when [`onClose`](https://ariakit.com/reference/dialog#onclose) prevents the close.

These fixes apply to all components built on [`Dialog`](https://ariakit.com/reference/dialog), including [`Popover`](https://ariakit.com/reference/popover), [`Hovercard`](https://ariakit.com/reference/hovercard), [`Menu`](https://ariakit.com/reference/menu), [`Tooltip`](https://ariakit.com/reference/tooltip), [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover), and [`SelectPopover`](https://ariakit.com/reference/select-popover).
