---
"@ariakit/test": patch
---

Added `press.down` and `press.up` to `@ariakit/test`, which fire only the keydown or keyup half of a key press and default to the currently focused element, so a key released after focus moved away — for example, an element that disables itself on keydown — lands where a real browser would deliver it. Both provide the same per-key shortcuts as `press`, such as `press.down.Space()` and `press.up.Enter()`.
