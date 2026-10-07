---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed <kbd>Escape</kbd> closing a non-modal popup before a popup that opened after it, and a modal popup not disabling that earlier popup, when the earlier popup moves while both are open: a [`Dialog`](https://ariakit.com/reference/dialog) that moves to a new portal node, such as when its [`portal`](https://ariakit.com/reference/dialog#portal) prop changes to `true`, or a [`Popover`](https://ariakit.com/reference/popover) that moves out of a portal, such as when its [`portal`](https://ariakit.com/reference/popover#portal) prop changes to `false` (for a modal popup, when it renders next to that popover). This applies to all components built on [`Dialog`](https://ariakit.com/reference/dialog) or [`Popover`](https://ariakit.com/reference/popover), such as [`Menu`](https://ariakit.com/reference/menu).
