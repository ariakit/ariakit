# Animated Select

<div data-description>

Animating <a href="/components/select">Select</a> using CSS transitions in React. The component waits for the transition to finish before completely hiding the popover.

</div>

The [`animated`](/apis/select-store#animated) prop on the [`useSelectStore`](/apis/select-store) hook must be set to `true`. Ariakit will assign the `data-enter` and `data-leave` attributes and wait for the transition to finish before hiding or unmounting the select popover.

<a href="./index.tsx" data-playground>Example</a>

## Styling

Use the `data-enter` and `data-leave` attributes to animate the popover:

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
