---
"@ariakit/store": patch
"@ariakit/solid-store": patch
---

Fixed `setup`, `init`, `subscribe`, `sync`, and `batch` returning `undefined` instead of a cleanup function when the store is `null` or `undefined`. They now return a function that does nothing, so calling the result no longer throws `TypeError`.
