---
"@ariakit/react-components": patch
---

Updated `PopoverArrow` to use computed colors directly

[`PopoverArrow`](https://ariakit.com/reference/popover-arrow) and its siblings ([`MenuArrow`](https://ariakit.com/reference/menu-arrow), [`TooltipArrow`](https://ariakit.com/reference/tooltip-arrow), [`HovercardArrow`](https://ariakit.com/reference/hovercard-arrow)) now set `fill` and `stroke` directly from the popover content's computed `background-color` and `border-color`, removing the previous `var(--ak-layer, …)` and `var(--ak-edge, …)` wrappers. Style the arrow with CSS if you need custom theming.
