---
"@ariakit/test": patch
---

Selection-ready test gestures

The `press` and `type` helpers now derive `KeyboardEvent.code` from a US keyboard layout when callers omit it. The `type` helper also treats Meta and Control chords as commands, so printable shortcut keys do not insert text. An explicit `code` still takes precedence.

```ts
await type("k", input, { metaKey: true });
```
