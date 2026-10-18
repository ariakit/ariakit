---
"@ariakit/store": patch
"@ariakit/solid-store": patch
---

Fixed the return types of `pick` and `omit` to include `undefined` when the store argument can be `null` or `undefined`.
