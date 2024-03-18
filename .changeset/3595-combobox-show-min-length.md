---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Minimum value length to show combobox options

A new [`showMinLength`](https://ariakit.org/reference/combobox#showminlength) prop has been added to the [`Combobox`](https://ariakit.org/reference/combobox) component. This prop lets you set the minimum length of the value before the combobox options appear. The default value is `0`.

```jsx
<Combobox showMinLength={2} />
```

Previously, achieving this behavior required combining three separate props: [`showOnChange`](https://ariakit.org/reference/combobox#showonchange), [`showOnClick`](https://ariakit.org/reference/combobox#showonclick), and [`showOnKeyPress`](https://ariakit.org/reference/combobox#showonkeypress). We've added this prop to simplify this common task.

These props continue to work as expected as they can be used to customize the behavior for each distinct event.
