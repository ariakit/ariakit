---
"@ariakit/test": patch
---

Fixed keyboard events in the test environment so `getModifierState` matches the exact modifier names in UI Events and reports the `modifier*` members the event was built with, such as `AltGraph` and `CapsLock`, instead of reading `AltGraph` from `Alt` and matching a name like `shift` case-insensitively.
