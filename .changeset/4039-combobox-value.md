---
"@ariakit/react": patch
---

New `ComboboxValue` component

A [`ComboboxValue`](https://ariakit.org/reference/combobox-value) component is now available. This _value_ component displays the current value of the combobox input without rendering any DOM elements or taking any HTML props. You can optionally pass a function as a child returning any React node based on the current value:

```jsx
<ComboboxProvider>
  <Combobox />
  <ComboboxValue>
    {(value) => `Current value: ${value}`}
  </ComboboxValue>
</ComboboxProvider>
```
