# Button

<p data-description>
  Trigger an action or event, such as submitting a <a href="/components/form">Form</a>, opening a <a href="/components/dialog">Dialog</a>, canceling an action, or performing a delete operation in React. This component is based on the <a href="https://www.w3.org/WAI/ARIA/apg/patterns/button/">WAI-ARIA Button Pattern</a>.
</p>

<a href="../examples/button/index.tsx" data-playground>Example</a>

## API

```jsx
<Button />
```

## Activating on <kbd>Enter</kbd> and <kbd>Space</kbd>

By default, native button elements are clicked during the <kbd>Enter</kbd> keydown and <kbd>Space</kbd> keyup events. It is recommended to use native buttons whenever possible since they are more accessible and have better browser support.

However, if you need to render `Button` as a different element, you can do so through [composition](/guide/composition). Ariakit will ensure that both <kbd>Enter</kbd> and <kbd>Space</kbd> activate the button. This behavior can be controlled with the [`clickOnEnter`](/reference/button#clickonenter) and [`clickOnSpace`](/reference/button#clickonspace) props, which default to `true`.

## Styling

<aside data-type="note">

For more information on styling with Ariakit, refer to the [Styling](/guide/styling) guide.

</aside>

### Styling the focus-visible state

Since `Button` uses [Focusable](/components/focusable), you can style its focus-visible state using the `data-focus-visible` attribute. This is similar to the native [:focus-visible pseudo-class](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible), but it also supports [composite widgets](/components/composite) with [`virtualFocus`](/reference/use-composite-store#virtualfocus):

```css
.button[data-focus-visible] {
  outline: 2px solid red;
}
```

Alternatively, you can use the [`onFocusVisible`](/reference/button#onfocusvisible) prop to handle the state in JavaScript.

### Styling the disabled state

When the [`accessibleWhenDisabled`](/reference/button#accessiblewhendisabled) prop is `true`, the button element won't have the `disabled` attribute. This is so users can still focus on the button while it's disabled. Because of this, you should use `aria-disabled` to style the disabled state:

```css
.button[aria-disabled="true"] {
  opacity: 0.5;
}
```

## Related components

<div data-cards="components">

- [](/components/disclosure)
- [](/components/menu)
- [](/components/select)
- [](/components/toolbar)
- [](/components/focusable)
- [](/components/command)

</div>
