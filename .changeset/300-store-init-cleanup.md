---
"@ariakit/store": patch
"@ariakit/solid-store": patch
---

Fixed `init` cleanups so repeated or stale calls do not rerun store setup teardowns.
