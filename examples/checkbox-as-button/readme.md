# Checkbox as button

<p data-description>
  Rendering a custom <a href="/components/checkbox">Checkbox</a> as a <code>button</code> element in React, while keeping it accessible to screen reader and keyboard users.
</p>

<a href="./index.tsx" data-playground>Example</a>

## Styling

When rendering the `Checkbox` component as a non-native `input` element, the `:checked` pseudo-class is not supported. To style the checked state, use the `aria-checked` attribute selector:

```css
.button[aria-checked="true"] {
  background-color: hsl(204 100% 40%);
  color: hsl(204, 20%, 100%);
}
```

Learn more on the [Styling](/guide/styling) guide.
