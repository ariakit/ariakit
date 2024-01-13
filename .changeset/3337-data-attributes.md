---
"@ariakit/react-core": minor
"@ariakit/react": minor
---

Public data attributes have now boolean values

**BREAKING** if you're depending on [data attributes](https://ariakit.org/guide/styling#data-active) to carry an empty string (`""`) value.

In previous versions, data attributes such as [`data-active`](https://ariakit.org/guide/styling#data-active), [`data-active-item`](https://ariakit.org/guide/styling#data-active-item), [`data-enter`](https://ariakit.org/guide/styling#data-enter), [`data-leave`](https://ariakit.org/guide/styling#data-leave), and [`data-focus-visible`](https://ariakit.org/guide/styling#data-focus-visible) would carry an empty string (`""`) value when active, and `undefined` when inactive. Now, they have a `true` value when active, but remain `undefined` when inactive.

Their use as CSS selectors remains unchanged. You should continue to select them with the attribute selector with no value (e.g., `[data-enter]`). However, if you're employing them in different ways or have snapshot tests that depend on their value, you might need to update your code.
