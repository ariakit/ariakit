---
"@ariakit/store": patch
"@ariakit/solid-store": patch
---

Fixed `createStore` to keep parent stores in sync when a parent listener rewrites a value during a multi-parent fan-out.
