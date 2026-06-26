---
"@ariakit/store": patch
"@ariakit/solid-store": patch
---

Fixed store listener cleanup disposal so synchronous store updates during unsubscribe do not rerun detached listeners.
