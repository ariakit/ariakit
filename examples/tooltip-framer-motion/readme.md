---
tags:
  - Tooltip
  - Animated
  - Framer Motion
---

# Tooltip with Framer Motion

<div data-description>

Abstracting [Tooltip](/components/tooltip) into a reusable custom component that uses [Framer Motion](https://www.framer.com/motion/) to create smooth initial and exit animations.

</div>

<div data-tags></div>

<a href="./index.react.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/tooltip)

</div>

## Composing with other components

In the custom `TooltipAnchor` component we've created in this example, we're exposing the [`render`](/reference/tooltip-anchor#render) prop to allow the user to render the anchor element however they want.

```jsx
<TooltipAnchor render={<a />} />
```

You can learn more about this pattern on the [Composition](/guide/composition) guide.

## Related examples

<div data-cards="examples">

- [](/examples/menu-framer-motion)
- [](/examples/dialog-framer-motion)
- [](/examples/menu-tooltip)

</div>
