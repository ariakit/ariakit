---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Improved `Dialog` performance

Opening a modal [`Dialog`](https://ariakit.com/reference/dialog) now marks and disables the elements outside the dialog in a single tree walk instead of two, tracks the dialog state with fewer store subscriptions, and finds the initial focus target without checking every tabbable element inside the dialog. This also benefits components built on top of it, such as [`Popover`](https://ariakit.com/reference/popover), [`Menu`](https://ariakit.com/reference/menu), and [`SelectPopover`](https://ariakit.com/reference/select-popover).
