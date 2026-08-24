---
"@ariakit/test": patch
---

Keyboard shortcut events in `@ariakit/test`

The `press()` helpers now infer `KeyboardEvent.code` from a US keyboard table when the caller does not provide a code. An explicit code still takes precedence.

The `type()` helper now dispatches Control and Meta combinations without inserting printable text into an editable target.

```ts
await press("k", input, { metaKey: true });
// key: "k", code: "KeyK"; input value is unchanged
```
