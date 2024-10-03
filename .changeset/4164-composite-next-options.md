---
"@ariakit/core": patch
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Overriding composite state for specific methods

The [`next`](https://ariakit.org/reference/use-composite-store#next), [`previous`](https://ariakit.org/reference/use-composite-store#previous), [`up`](https://ariakit.org/reference/use-composite-store#up), and [`down`](https://ariakit.org/reference/use-composite-store#down) methods of the [composite store](https://ariakit.org/reference/use-composite-store) now accept an object as the first argument to override the composite state for that specific method. For example, you can pass a different [`activeId`](https://ariakit.org/reference/use-composite-store#activeId) value to the [`next`](https://ariakit.org/reference/use-composite-store#next) method so it returns the next item based on that value rather than the current active item in the composite store:

```js
const store = useCompositeStore({ defaultActiveId: "item1" });
const item3 = composite.next({ activeId: "item2" });
```

It's important to note that the composite state is not modified when using this feature. The state passed to these methods is used solely for that specific method call.
