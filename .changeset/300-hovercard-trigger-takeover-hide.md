---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Hovercard`](https://ariakit.com/reference/hovercard) hiding while the pointer rests on another trigger element that shares its store, such as when moving the pointer from one [`Menubar`](https://ariakit.com/reference/menubar) item to the next with a shared [`Menu`](https://ariakit.com/reference/menu), or from one [`TooltipAnchor`](https://ariakit.com/reference/tooltip-anchor) to the next with a shared [`Tooltip`](https://ariakit.com/reference/tooltip). This applies to all components built on [`Hovercard`](https://ariakit.com/reference/hovercard), including [`Menu`](https://ariakit.com/reference/menu) and [`Tooltip`](https://ariakit.com/reference/tooltip).
