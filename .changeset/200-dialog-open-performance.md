---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Improved `Dialog` performance

Opening a modal [`Dialog`](https://ariakit.com/reference/dialog) now marks and disables the elements outside the dialog in a single tree walk instead of two, tracks the dialog state with fewer store subscriptions, and finds the initial focus target without checking every tabbable element inside the dialog.

The scroll lock, the backdrop z-index synchronization, and the root-dialog bookkeeping also moved from passive effects to the layout phase, removing several forced style recalculations and layouts from the open path and applying the scroll lock before the dialog is first painted.

This also benefits components built on top of [`Dialog`](https://ariakit.com/reference/dialog), such as [`Popover`](https://ariakit.com/reference/popover), [`Menu`](https://ariakit.com/reference/menu), and [`SelectPopover`](https://ariakit.com/reference/select-popover).
