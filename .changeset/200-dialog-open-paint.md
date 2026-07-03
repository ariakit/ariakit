---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Faster modal `Dialog` opening

Opening a modal [`Dialog`](https://ariakit.com/reference/dialog), or components built on it such as [`Popover`](https://ariakit.com/reference/popover) and [`Menu`](https://ariakit.com/reference/menu), no longer waits for the page behind it to be disabled before painting.

Previously, making the element tree outside the dialog inert invalidated the styles of the entire page before the dialog's first paint, delaying the open in proportion to the page size. This step now runs right after the dialog is first painted. For the same reason, the dialog now also sets its `--dialog-viewport-height` property right after the first paint, since reading the viewport height would otherwise force a synchronous layout of the entire page before the dialog appears.
