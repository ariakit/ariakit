---
"@ariakit/test": patch
---

Added `press.down` and `press.up`

The `press` utility now provides `press.down` and `press.up` to fire only the keydown or keyup half of a key press, each with the same per-key shortcuts as `press` (`press.down.Space()`, `press.up.Enter()`, and so on). Both default to the currently focused element, so a key released after focus moved away — for example, an element that disables itself on keydown — lands where a real browser would deliver it.

```ts
// Press and release in two steps; the keyup lands wherever focus is at release
// time, not necessarily where the keydown happened.
await press.down.Space();
await press.up.Space();
```
