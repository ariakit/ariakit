---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed <kbd>Escape</kbd> closing a non-modal [`Dialog`](https://ariakit.com/reference/dialog) before a popup that opened after it, and a modal popup not disabling that dialog, when the dialog moves to a new portal node while both are open, such as when its [`portal`](https://ariakit.com/reference/dialog#portal) prop changes to `true`. This applies to all components built on [`Dialog`](https://ariakit.com/reference/dialog), such as [`Popover`](https://ariakit.com/reference/popover) and [`Menu`](https://ariakit.com/reference/menu).
