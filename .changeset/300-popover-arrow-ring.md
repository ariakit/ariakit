---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

`PopoverArrow` box-shadow ring detection

Fixed [`PopoverArrow`](https://ariakit.com/reference/popover-arrow), including components built on it such as [`TooltipArrow`](https://ariakit.com/reference/tooltip-arrow), [`MenuArrow`](https://ariakit.com/reference/menu-arrow), and [`HovercardArrow`](https://ariakit.com/reference/hovercard-arrow), to draw the popover's box-shadow ring for any positive ring width. Previously, widths whose text contained the digit 0, such as `10px` or `0.5px` from the Tailwind `ring-[10px]` and `ring-[0.5px]` utilities, were not detected, and the arrow rendered with no stroke at all.

The arrow stroke now also matches the ring color instead of the popover's inherited text color, so the arrow blends into the outline. This includes `inset` rings and rings without an explicit color, which default to `currentColor` following CSS.
