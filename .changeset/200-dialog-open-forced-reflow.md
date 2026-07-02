---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Improved [`Dialog`](https://ariakit.com/reference/dialog) and [`Popover`](https://ariakit.com/reference/popover) open performance. Measuring the viewport height for the `--dialog-viewport-height` CSS variable, syncing the backdrop's `z-index`, and syncing the [`Popover`](https://ariakit.com/reference/popover) position wrapper's `z-index` now run right before the browser paints, so opening these components — or components built on them, such as [`Menu`](https://ariakit.com/reference/menu) and [`Hovercard`](https://ariakit.com/reference/hovercard) — no longer triggers duplicate style recalculations.
