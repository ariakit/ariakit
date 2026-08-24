---
"@ariakit/components": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Composite move selection options

The [`move`](https://ariakit.com/reference/use-composite-store#move) function now accepts an optional second argument with `extend` and `anchor` options. Selectable composite stores use these options to extend a range or set its anchor. Plain composite stores ignore the selection options and continue to move focus.

```ts
store.move(store.next(), { extend: true });
store.move("item-1", { anchor: true });
```
