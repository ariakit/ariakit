# Animated Dialog

<p class="description">
  <a href="/guide/animating">Animating</a> a modal <a href="/components/dialog">Dialog</a> and its backdrop using CSS. The component waits for the transition to finish before completely hiding the dialog or removing it from the React tree.
</p>

The [`animated`](/api-reference/dialog-state#animated) prop on the [`useDialogState`](/api-reference/dialog-state) hook must be set to `true`. Ariakit will assign the `data-enter` and `data-leave` attributes and wait for the transition to finish before hiding or unmounting the dialog.

<a href="./index.tsx" data-playground>Example</a>

## Styling

Use the `data-enter` and `data-leave` attributes to animate the dialog and the backdrop elements:

```css
[data-backdrop] {
  opacity: 0;
  transition: opacity 200ms;
}

[data-backdrop][data-enter] {
  opacity: 1;
}

.dialog {
  transform: scale(0.9);
  transition: transform 200ms;
}

.dialog[data-enter] {
  transform: scale(1);
}
```

Learn more in [Styling](/guide/styling#animations).
