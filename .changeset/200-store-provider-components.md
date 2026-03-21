---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Improved `store` prop migration for provider context fallbacks

Components that accept a [`store`](https://ariakit.org/reference/combobox#store) prop can now receive a provider component, such as `store={ComboboxProvider}`, to read the corresponding context explicitly across compatible providers.

A deprecation warning is now logged when those components still rely on implicit compatible provider context fallbacks. Pass the provider component to the `store` prop to keep the current behavior without the warning while preparing for the future breaking change.

```tsx
<ComboboxProvider>
  <CompositeItem store={ComboboxProvider} />
</ComboboxProvider>
```
