---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Composite`](https://ariakit.com/reference/composite) and components built on it, such as [`Menu`](https://ariakit.com/reference/menu) and [`Toolbar`](https://ariakit.com/reference/toolbar), building the events they synthesize with the outer window's constructors, so an item inside a same-origin iframe received events that failed `instanceof` against that frame's own interfaces.
