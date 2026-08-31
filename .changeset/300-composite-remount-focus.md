---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Composite`](https://ariakit.com/reference/composite) taking focus itself or moving focus to the item that was active before, and scrolling the page to it, when it becomes a composite widget anew after being rendered again or after the [`composite`](https://ariakit.com/reference/composite#composite-1) prop switches back on, with no new [`move`](https://ariakit.com/reference/use-composite-store#move) call behind it. This also applies to all components built on it, such as [`Menu`](https://ariakit.com/reference/menu) and [`Toolbar`](https://ariakit.com/reference/toolbar).
