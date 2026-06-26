---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed a portaled [`Popover`](https://ariakit.com/reference/popover) or [`Dialog`](https://ariakit.com/reference/dialog) not receiving focus when reopened while a non-focusable element (such as a `display: none` file input) comes before the first focusable element in its content. This also fixes [`FormLabel`](https://ariakit.com/reference/form-label) focusing such a hidden element instead of the visible control.
