---
"@ariakit/test": patch
---

Fixed mouse events in the test environment to expose `getModifierState` for `Alt`, `Control`, `Meta`, and `Shift`, plus the `x` and `y` aliases of `clientX` and `clientY`, so a listener reading modifier state no longer throws a `TypeError` on an event passed to `dispatch(element, event)` or on the `auxclick` that `rightClick` and `click` with a non-primary `button` fire.
