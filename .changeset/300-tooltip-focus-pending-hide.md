---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Tooltip`](https://ariakit.com/reference/tooltip) hiding when its [`TooltipAnchor`](https://ariakit.com/reference/tooltip-anchor) receives keyboard focus while the tooltip waits to hide after the pointer leaves the anchor. [`Hovercard`](https://ariakit.com/reference/hovercard) now checks [`hideOnHoverOutside`](https://ariakit.com/reference/hovercard#hideonhoveroutside) again when the [`hideTimeout`](https://ariakit.com/reference/hovercard-provider#hidetimeout) delay ends, which applies to all components built on [`Hovercard`](https://ariakit.com/reference/hovercard), including [`Menu`](https://ariakit.com/reference/menu) and [`Tooltip`](https://ariakit.com/reference/tooltip).
