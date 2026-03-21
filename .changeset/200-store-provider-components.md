---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Provider components can now be passed to the `store` prop

Components that accept a [`store`](https://ariakit.org/reference/combobox#store)
prop can now receive a provider component, such as
`store={ComboboxProvider}`, to read the corresponding context explicitly across
compatible providers.

```tsx
<ComboboxProvider>
  <CompositeItem store={ComboboxProvider} />
</ComboboxProvider>
```
