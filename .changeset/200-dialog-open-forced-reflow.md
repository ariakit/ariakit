---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Faster `Dialog` and `Popover` opening

Opening a [`Dialog`](https://ariakit.com/reference/dialog) or [`Popover`](https://ariakit.com/reference/popover) — including components built on them, such as [`Menu`](https://ariakit.com/reference/menu) and [`Hovercard`](https://ariakit.com/reference/hovercard) — no longer triggers duplicate style recalculations.

Previously, measuring the viewport height for the `--dialog-viewport-height` CSS variable, syncing the backdrop's `z-index` with the dialog, and syncing the [`Popover`](https://ariakit.com/reference/popover) position wrapper's `z-index` forced a synchronous style and layout flush while the document was still being updated by the open render. These measurements now run right before the browser paints, when styles would be recalculated anyway.
