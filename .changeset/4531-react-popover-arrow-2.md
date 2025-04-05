---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Improved `PopoverArrow`

The [`PopoverArrow`](https://ariakit.org/reference/popover-arrow) component now attempts to infer its border width from the popover’s `box-shadow` style when all lengths are `0px` and the spread radius exceeds `0px` (e.g., `box-shadow: 0 0 0 1px black`), which is commonly known as a "ring". If the border width cannot be inferred, you can use the new [`borderWidth`](https://ariakit.org/reference/popover-arrow#borderwidth) prop to define it. This ensures a consistent size regardless of the arrow's size, which wasn't achievable before when manually setting the CSS `stroke-width` property.

In addition, the arrow’s SVG path has been slightly modified to be more angled in the pointing direction. Note that you can always provide your own SVG using the `children` prop.
