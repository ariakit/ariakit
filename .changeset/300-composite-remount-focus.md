---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Composite`](https://ariakit.com/reference/composite) replaying an earlier [`move`](https://ariakit.com/reference/use-composite-store#move) call, taking focus and scrolling the page, when it is mounted again or when the [`composite`](https://ariakit.com/reference/composite#composite-1) prop switches back on. This also applies to all components built on it, such as [`Menu`](https://ariakit.com/reference/menu) and [`Toolbar`](https://ariakit.com/reference/toolbar).
