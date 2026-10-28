---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Hovercard`](https://ariakit.com/reference/hovercard) closing again right after it reopens during its exit transition when the pointer moved outside it just before, such as when a [`TooltipAnchor`](https://ariakit.com/reference/tooltip-anchor) receives keyboard focus at that moment. This applies to all components built on [`Hovercard`](https://ariakit.com/reference/hovercard), including [`Menu`](https://ariakit.com/reference/menu) and [`Tooltip`](https://ariakit.com/reference/tooltip).
