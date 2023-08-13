---
"@ariakit/core": patch
---

Removed private properties from the store object. ([#2706](https://github.com/ariakit/ariakit/pull/2706))

Instead of accessing `store.setup`, `store.sync`, `store.subscribe`, etc. directly, use the equivalent functions exported by the `@ariakit/core/utils/store` module.

