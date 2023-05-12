# Animated Dialog

<p data-description>
  Animating a modal <a href="/components/dialog">Dialog</a> and its backdrop using CSS. The component waits for the transition to finish before completely hiding the dialog or removing it from the React tree.
</p>

<a href="./index.tsx" data-playground>Example</a>

## Styling

Use the `data-enter` and `data-leave` attributes to animate the dialog and the backdrop elements:

```css
.backdrop {
  opacity: 0;
  transition: opacity 200ms;
}

.backdrop[data-enter] {
  opacity: 1;
}

.dialog {
  transform: scale(0.95);
  transition: transform 200ms;
}

.dialog[data-enter] {
  transform: scale(1);
}
```

You can learn more about these `data-*` attributes on the [Styling](/guide/styling) guide.
