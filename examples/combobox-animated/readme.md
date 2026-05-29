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

Animating a [Combobox](/components/combobox) using CSS transitions in React. The component waits for the transition to finish before completely hiding the popover.

</div>

<div data-tags></div>

<a href="./index.react.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/combobox)

</div>

## Styling

Ariakit will automatically assign the `data-enter` and `data-leave` attributes to the popover element when it opens and closes. You can use these attributes as selectors to add CSS transitions to the popover.

```css
.popover {
  opacity: 0;
  transition: opacity 150ms;
}

.popover[data-enter] {
  opacity: 1;
}
```

For more information, refer to the [Styling](/guide/styling) guide.

## Related examples

<div data-cards="examples">

- [](/examples/combobox-filtering)
- [](/examples/dialog-combobox-tab-command-menu)
- [](/examples/dialog-animated)
- [](/examples/disclosure-animated)
- [](/examples/select-animated)
- [](/examples/tab-panel-animated)

</div>
