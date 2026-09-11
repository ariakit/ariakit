---
"@ariakit/react": patch
"@ariakit/react-components": patch
---

Fixed [`PopoverArrow`](https://ariakit.com/reference/popover-arrow) keeping the colors it read when the popover first rendered, so an arrow opened after a theme change no longer shows the previous theme's fill and stroke. This also applies to components built on it, such as [`TooltipArrow`](https://ariakit.com/reference/tooltip-arrow) and [`MenuArrow`](https://ariakit.com/reference/menu-arrow).
