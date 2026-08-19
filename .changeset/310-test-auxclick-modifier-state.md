---
"@ariakit/test": patch
---

Fixed the `auxclick` that `rightClick` and `click` with a non-primary `button` fire to report the same modifier state as the rest of the gesture, so `modifier*` init members such as `modifierCapsLock` and `modifierAltGraph` now reach `getModifierState` on every mouse event the gesture produces.
