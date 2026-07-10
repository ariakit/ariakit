---
"@ariakit/react-components": patch
"@ariakit/react-store": patch
"@ariakit/react-utils": patch
"@ariakit/react": patch
---

Store props and store hooks accept provider components

Component `store` props now accept a provider component (for example, [`ComboboxProvider`](https://ariakit.com/reference/combobox-provider)) in place of a store object. The store is read from that provider's context, which lets you explicitly bind a component to a specific provider kind even when a different compatible provider is nested closer.

For example, [`CompositeItem`](https://ariakit.com/reference/composite-item) can read from the closest [`ComboboxProvider`](https://ariakit.com/reference/combobox-provider) even when a [`ToolbarProvider`](https://ariakit.com/reference/toolbar-provider) or [`CompositeProvider`](https://ariakit.com/reference/composite-provider) is nested closer to it:

```tsx
<CompositeItem store={ComboboxProvider} />
```

If no matching provider context exists above the component, the store resolves to `undefined` rather than falling back to a closer compatible context. Note that components composed from multiple layers may still bind lower-level behavior to their own contexts in that case.

The [`useStoreState`](https://ariakit.com/reference/use-store-state) and `useStoreStateObject` hooks accept provider components as well:

```tsx
const value = useStoreState(ComboboxProvider, "value");
```

The new `ProviderComponent` type is exported from `@ariakit/react` and `@ariakit/react-store` so you can reference the widened props in your own types:

```tsx
interface Props {
  store?: ComboboxStore | ProviderComponent<ComboboxStore>;
}
```

Note that this is a type-level change to the `store` props: passing store objects keeps working as before, but code that reads a widened `store` prop type and passes its value to an API that expects a store object (for example, [`useFormValidate`](https://ariakit.com/reference/use-form-validate)) must now re-narrow the prop:

```tsx
interface FormProps extends Ariakit.FormProps {
  // Accept only store objects so the prop can be passed to useFormValidate.
  store?: Ariakit.FormStore;
}
```
