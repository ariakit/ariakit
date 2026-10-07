---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed <kbd>Escape</kbd> closing a non-modal [`Popover`](https://ariakit.com/reference/popover) before a popup that opened after it, and a modal popup that renders next to it not disabling that popover, when the popover moves out of a portal while both are open, such as when its [`portal`](https://ariakit.com/reference/popover#portal) prop changes to `false`. This applies to all components built on [`Popover`](https://ariakit.com/reference/popover), such as [`Menu`](https://ariakit.com/reference/menu).
