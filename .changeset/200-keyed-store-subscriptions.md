---
"@ariakit/react-store": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Keyed store subscriptions

The [`useStoreState`](https://ariakit.com/reference/use-store-state) and `useStoreStateObject` hooks now accept selector dependency keys, so selectors skip unrelated store updates while receiving the complete store state at runtime. The key list must include every store key a selector reads, or its result may stay stale.

```ts
const isEmpty = useStoreState(store, ["value"], (state) => !state.value);

const values = useStoreStateObject(store, ["value"], {
  value: "value",
  valueLength: (state) => state.value.length,
});
```

React components now use keyed selector subscriptions internally.
