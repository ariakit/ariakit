---
tags:
  - Combobox
  - Animated
  - CSS transitions
  - Dropdowns
  - Form controls
---

# Animated Combobox

<div data-description>

Animating a [Combobox](/components/combobox) using CSS transitions in React. The component waits for the transition to finish before completely hiding the popover using the [`animated`](/reference/combobox-provider#animated) prop.

</div>

<div data-tags></div>

<a href="./index.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/combobox)

</div>

## Styling

When the [`animated`](/reference/combobox-provider#animated) prop is set to `true` on the [`ComboboxProvider`](/reference/combobox-provider) component, Ariakit will assign the `data-enter` and `data-leave` attributes to the popover. You can use these attributes as selectors to add CSS transitions to the popover.

```css
.popover {
  opacity: 0;
  transition: opacity 150ms;
}

.popover[data-enter] {
  opacity: 1;
}
```

Learn more on the [Styling](/guide/styling) guide.

## Related examples

<div data-cards="examples">

- [](/examples/combobox-filtering-integrated)
- [](/examples/combobox-group)
- [](/examples/dialog-animated)
- [](/examples/dialog-framer-motion)
- [](/examples/menu-framer-motion)
- [](/examples/tooltip-framer-motion)

</div>
