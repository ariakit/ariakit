---
"@ariakit/react-core": minor
"@ariakit/react": minor
---

[`#2776`](https://github.com/ariakit/ariakit/pull/2776) **BREAKING**: This should affect very few people. The `combobox` state on `useSelectStore` has been removed. You can still pass `combobox` as a prop to `useSelectStore`, but you won't be able to access `selectStore.useState("combobox")` anymore.
