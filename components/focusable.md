---
tags:
  - Focusable
---

# Focusable

<div data-description>

Press <kbd>Tab</kbd> or click to shift focus to any React element. This abstract component standardizes focus behavior across different browsers.

</div>

<div data-tags></div>

## API

```jsx
<Focusable />
```

## Styling

### Styling the focus-visible state

You can style the focus-visible state of `Focusable` elements using the `data-focus-visible` attribute. This is similar to the [:focus-visible pseudo-class](https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible), but it also supports [composite widgets](/components/composite) with [`virtualFocus`](/reference/use-composite-store#virtualfocus):

```css
.focusable[data-focus-visible] {
  outline: 2px solid red;
}
```

Alternatively, you can use the [`onFocusVisible`](/reference/focusable#onfocusvisible) prop to handle the state in JavaScript.

Learn more on the [Styling](/guide/styling) guide.
