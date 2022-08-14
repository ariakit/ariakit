# Animated Combobox

<p class="description">
  Animating a <a href="/components/combobox">Combobox</a> using CSS transitions in React. The component waits for the transition to finish before completely hiding the popover.
</p>

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
