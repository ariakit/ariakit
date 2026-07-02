---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Dialog`](https://ariakit.com/reference/dialog) and components built on it such as [`Popover`](https://ariakit.com/reference/popover) and [`Menu`](https://ariakit.com/reference/menu) hiding on close before the [`backdrop`](https://ariakit.com/reference/dialog#backdrop) element's exit transition ends: the backdrop's fade-out was skipped entirely when only the backdrop was animated, and cut short when its transition was longer than the panel's.
