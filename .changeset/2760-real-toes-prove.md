---
"@ariakit/react-core": minor
---

[`#2760`](https://github.com/ariakit/ariakit/pull/2760) **BREAKING**: The `useStoreState` function exported by `@ariakit/react-core/utils/store` has been updated so it'll always run the selector callback even when the passed store is `null` or `undefined`.
