---
"@ariakit/react-components": patch
"@ariakit/react-store": patch
"@ariakit/react-utils": patch
"@ariakit/react": patch
---

Support provider components in store props and store hooks

Component `store` props now accept a provider component (for example, [`ComboboxProvider`](https://ariakit.com/reference/combobox-provider)) in place of a store object. The store is read from the closest matching provider through context, which lets you explicitly bind a component to a specific provider even when a different compatible provider is nested closer.

For example, [`CompositeItem`](https://ariakit.com/reference/composite-item) can read from the closest [`ComboboxProvider`](https://ariakit.com/reference/combobox-provider) even when a [`ToolbarProvider`](https://ariakit.com/reference/toolbar-provider) or [`CompositeProvider`](https://ariakit.com/reference/composite-provider) is nested closer to it:

```tsx
<CompositeItem store={ComboboxProvider} />
```

The [`useStoreState`](https://ariakit.com/reference/use-store-state) and `useStoreStateObject` hooks accept provider components as well:

```tsx
const value = useStoreState(ComboboxProvider, "value");
```
