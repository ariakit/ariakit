---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Dialog`](https://ariakit.com/reference/dialog) and components built on it such as [`Popover`](https://ariakit.com/reference/popover) and [`Menu`](https://ariakit.com/reference/menu) hiding instantly on close when only the [`backdrop`](https://ariakit.com/reference/dialog#backdrop) element is animated, which skipped the backdrop's exit transition.
