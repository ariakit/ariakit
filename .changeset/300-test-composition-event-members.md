---
"@ariakit/test": patch
---

Composition dispatchers report `data`, `view`, and `detail`

`dispatch.compositionStart`, `dispatch.compositionUpdate`, and `dispatch.compositionEnd` now report the members `CompositionEvent` defines, so a listener reading `data` receives the composed text instead of `undefined`, along with the `view` and `detail` the interface inherits from `UIEvent`.

`type` composes text through `dispatch.compositionUpdate` when you pass `isComposing`, so an IME-aware listener now reads each character it simulates.

This affected happy-dom, whose `CompositionEvent` is an alias for `Event`, and not jsdom or real browsers, which implement the interface themselves.
