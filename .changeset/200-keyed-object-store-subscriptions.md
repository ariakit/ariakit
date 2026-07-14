---
"@ariakit/react-store": patch
"@ariakit/react-components": patch
---

Keyed object store subscriptions

The `useStoreStateObject` hook now accepts selector dependency keys, so selectors skip unrelated store updates while receiving the complete store state at runtime. The key list must include every store key a selector reads, or its result may stay stale.

```ts
const values = useStoreStateObject(store, ["value"], {
  value: "value",
  valueLength: (state) => state.value.length,
});
```
