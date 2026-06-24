---
"@ariakit/store": patch
---

Fixed `subscribe` callbacks registered for all keys during a keyed store dispatch so they observe the in-flight update.
