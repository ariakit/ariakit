---
"@ariakit/react-store": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Added keyed store subscriptions

The [`useStoreState`](https://ariakit.com/reference/use-store-state) and `useStoreStateObject` hooks now accept selector dependency keys, so selectors skip unrelated store updates while receiving the complete store state at runtime.

Updated React components to use keyed selector subscriptions internally.
