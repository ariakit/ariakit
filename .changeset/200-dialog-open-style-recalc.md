---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Improved style recalculation when opening a modal `Dialog`

Opening a modal [`Dialog`](https://ariakit.com/reference/dialog), or a dialog-based component such as [`Popover`](https://ariakit.com/reference/popover) or [`Menu`](https://ariakit.com/reference/menu) with the [`modal`](https://ariakit.com/reference/popover#modal) prop, no longer recalculates the dialog subtree styles twice before the browser paints. The `--dialog-viewport-height` variable is now written while the subtree styles are already invalidated by the dialog's own mount, and repeated writes of the same height are skipped when the viewport resizes.

The style invalidation caused by disabling the tree outside the dialog is also flushed right where it originates. Performance profiles now attribute that cost to the tree disabling code instead of whichever style read happened to run first, such as the viewport height measurement.
