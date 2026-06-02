---
"@ariakit/store": patch
"@ariakit/solid-store": patch
---

Fixed initialized child stores to avoid notifying listeners twice when they update shared parent state.
