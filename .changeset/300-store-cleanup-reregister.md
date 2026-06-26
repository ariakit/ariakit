---
"@ariakit/store": patch
"@ariakit/solid-store": patch
---

Fixed `sync` and `batch` to run a listener's pending cleanup before re-registering the same listener.
