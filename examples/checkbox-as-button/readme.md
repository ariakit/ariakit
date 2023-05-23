# Checkbox as button

<p data-description>
  Rendering a custom <a href="/components/checkbox">Checkbox</a> as a <code>button</code> element in React, while keeping it accessible to screen reader and keyboard users.
</p>

<aside data-type="note" title="Need to render a native checkbox element?">

This example demonstrates the rendering of a button element. However, if you intend to render the `Checkbox` as a form control or require the preservation of native input element properties for any specific purpose, please refer to the [Custom Checkbox](/examples/checkbox-custom) example.

</aside>

<a href="./index.tsx" data-playground>Example</a>

## Components

<div data-cards="components">

- [](/components/checkbox)
- [](/components/button)

</div>

## Activating on <kbd>Enter</kbd>

By default, native checkbox elements are activated on <kbd>Space</kbd>, but not on <kbd>Enter</kbd>. The Ariakit `Checkbox` component allows you to control this behavior using the [`clickOnEnter`](/apis/checkbox#clickonenter) and [`clickOnSpace`](/apis/checkbox#clickonspace) props. However, when rendering the `Checkbox` as any non-native input element, the `clickOnEnter` prop will be automatically set to `true`.

## Reading the state

In this example, we're reading the [`value`](/apis/checkbox-store#value) state from the checkbox store to render the button's text. This is done by using the selector form of the [`useState`](/apis/checkbox-store#usestate) hook:

```jsx
const label = checkbox.useState((state) =>
  state.value ? "Checked" : "Unchecked"
);
```

Learn more about reading the state on the [Component stores](/guide/component-stores#reading-the-state) guide.

## Styling

When rendering the `Checkbox` component as a non-native `input` element, the `:checked` pseudo-class is not supported. To style the checked state, use the `aria-checked` attribute selector:

```css
.button[aria-checked="true"] {
  background-color: hsl(204 100% 40%);
  color: hsl(204 20% 100%);
}
```

Learn more on the [Styling](/guide/styling) guide.

## Related examples

<div data-cards="examples">

- [](/examples/checkbox-custom)
- [](/examples/checkbox-group)
- [](/examples/menu-item-checkbox)

</div>
