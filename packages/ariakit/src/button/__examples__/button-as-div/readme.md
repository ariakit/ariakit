# Button as div

<p class="description">
  Rendering a <a href="/components/button">Button</a> as a <code>div</code> element, while providing the same accessibility features as a native <code>button</code>.
</p>

<div class="warning">

### Before you use this example

When using the `Button` component, always prefer to use a native `button` element instead of a `div`. This example is provided for cases where a native button element is not possible, such as when using a third-party library that doesn't let you change the underlying element.

</div>

<a href="./index.tsx" data-playground>Example</a>

## Styling

When using the `Button` component as a non-native `button` element, the `:active` pseudo-class will not be triggered when the button is clicked with the <kbd>Space</kbd> key. To style the active state, use the `data-active` attribute selector:

```css
.button[data-active] {
  background-color: hsl(204 100% 32%);
}
```
