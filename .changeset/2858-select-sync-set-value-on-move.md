---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Fixed the [`setValueOnMove`](https://ariakit.org/reference/use-select-store#setvalueonmove) state on the [Select](https://ariakit.org/components/select) module not syncing between multiple stores.

The following now works as expected:

```js
const store1 = useSelectStore();
const store2 = useSelectStore({ store: store1, setValueOnMove: true });

store1.useState("setValueOnMove") === store2.useState("setValueOnMove"); // true
```
