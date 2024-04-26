---
"@ariakit/react": patch
---

New `SelectValue` component

A [`SelectValue`](https://ariakit.org/reference/select-value) component is now available. This is a _value_ component, which means it doesn't render any DOM elements and, as a result, doesn't take HTML props. Optionally, it can use a [`fallback`](https://ariakit.org/reference/select-value#fallback) prop as a default value if the store's [`value`](https://ariakit.org/reference/use-select-store#value) is `undefined`:

```jsx
<Select>
  <SelectValue fallback="Select a value" />
  <SelectArrow />
</Select>
```
