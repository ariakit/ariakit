---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Dialog`](https://ariakit.com/reference/dialog) so [`onClose`](https://ariakit.com/reference/dialog#onclose) only fires for Ariakit's built-in dismiss mechanisms, such as [`DialogDismiss`](https://ariakit.com/reference/dialog-dismiss), pressing <kbd>Esc</kbd>, or interacting outside the dialog, and no longer fires for programmatic visibility changes like a controlled [`open`](https://ariakit.com/reference/dialog#open) prop changing, `setOpen(false)`, or `store.hide()`.
