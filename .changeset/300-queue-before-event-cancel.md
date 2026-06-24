---
"@ariakit/utils": patch
---

Fixed `queueBeforeEvent` so the cancel function removes the pending event listener as well as the queued timer.
