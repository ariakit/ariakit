---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Composite`](https://ariakit.com/reference/composite) carrying out a pending [`move`](https://ariakit.com/reference/use-composite-store#move) request after [`setActiveId`](https://ariakit.com/reference/use-composite-store#setactiveid) changes the active item, including when a later update sets the active item back to the one the request asked for. This affects all components built on [`Composite`](https://ariakit.com/reference/composite), including [`Toolbar`](https://ariakit.com/reference/toolbar) and [`Menubar`](https://ariakit.com/reference/menubar).
