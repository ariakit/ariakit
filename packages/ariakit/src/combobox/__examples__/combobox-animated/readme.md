# Animated Combobox

<p data-description>
  Animating a <a href="/components/combobox">Combobox</a> using CSS transitions in React. The component waits for the transition to finish before completely hiding the popover.
</p>

The [`animated`](/api-reference/combobox-state#animated) prop on the [`useComboboxState`](/api-reference/combobox-state) hook must be set to `true`. Ariakit will assign the `data-enter` and `data-leave` attributes and wait for the transition to finish before hiding or unmounting the combobox popover.

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

Learn more in [Animating](/guide/animating).
