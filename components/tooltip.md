---
tags:
  - Tooltip
---

# Tooltip

<div data-description>

Display information related to an anchor element when the element receives keyboard focus or the mouse hovers over it. This component is based on the [WAI-ARIA Tooltip Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/).

</div>

<div data-tags></div>

<a href="../examples/tooltip/index.tsx" data-playground>Example</a>

## Examples

<div data-cards="examples">

- [](/examples/tooltip-framer-motion)

</div>

## API

```jsx
useTooltipStore()
useTooltipContext()

<TooltipProvider>
  <TooltipAnchor />
  <Tooltip>
    <TooltipArrow />
  </Tooltip>
</TooltipProvider>
```

## Tooltip anchors must have accessible names

By default, tooltips serve as non-critical descriptions and shouldn't be used as accessible labels for the anchor element. You should ensure the anchor element has an accessible name, either by:

- Rendering a visible label or [VisuallyHidden](/components/visually-hidden) text within the anchor element.
- Using the [`aria-label`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label) or [`aria-labelledby`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby) attributes on the anchor element.

Moreover, the [`TooltipAnchor`](/reference/tooltip-anchor) component should be rendered as an accessible widget through [composition](/guide/composition), like a button or a link, so it's properly announced by screen readers when it gains focus.

## Related components

<div data-cards="components">

- [](/components/hovercard)

</div>
