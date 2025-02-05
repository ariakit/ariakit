---
tags:
  - Select
  - Animated
  - CSS transitions
  - Dropdowns
  - Form controls
---

# Animated Select

<div data-description>

Animating [Select](/components/select) using CSS transitions in React. The component waits for the transition to finish before completely hiding the popover.

</div>

<div data-tags></div>

<a href="./index.react.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/select)

</div>

## Styling the animation

Use the `data-enter` and `data-leave` attributes to animate the [`SelectPopover`](/reference/select-popover) component using CSS transitions:

```css
.popover {
  opacity: 0;
  transition: opacity 150ms;
}

.popover[data-enter] {
  opacity: 1;
}
```

For more information on styling with Ariakit, refer to the [Styling](/guide/styling) guide.

## Related examples

<div data-cards="examples">

- [](/examples/select-combobox)
- [](/examples/select-group)
- [](/examples/dialog-animated)
- [](/examples/combobox-animated)
- [](/examples/toolbar-select)
- [](/examples/select-next-router)

</div>
