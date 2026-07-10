---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Improved [`Dialog`](https://ariakit.com/reference/dialog) performance by avoiding extra renders when tracking focus restoration. Focus is no longer moved back to the disclosure after the dialog has already reopened or been replaced. This also benefits components built on it, such as [`Popover`](https://ariakit.com/reference/popover) and [`Menu`](https://ariakit.com/reference/menu).
