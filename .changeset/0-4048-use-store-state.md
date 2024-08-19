---
"@ariakit/react": patch
---

New `useStoreState` hook

The [`useStoreState`](https://ariakit.org/reference/use-store-state) hook is now part of the public API. Previously used internally by dynamic `useState` hooks from Ariakit store objects, it is now available in the `@ariakit/react` package to ensure compatibility with the new React Compiler.

The following snippets are equivalent:

```js
const combobox = useComboboxStore();
const value = combobox.useState("value");
```

```js
const combobox = useComboboxStore();
const value = useStoreState(combobox, "value");
```

Besides working better with the new React Compiler, [`useStoreState`](https://ariakit.org/reference/use-store-state) is more flexible than `store.useState` as it accepts a store that is `null` or `undefined`, in which case the returned value will be `undefined`. This is useful when you're reading a store from a context that may not always be available:

```js
const combobox = useComboboxContext();
const value = useStoreState(combobox, "value");
```
