---
"@ariakit/core": minor
"@ariakit/react-core": minor
"@ariakit/react": minor
---

[`#2783`](https://github.com/ariakit/ariakit/pull/2783) **BREAKING** *(This should affect very few people)*: The `select` and `menu` props on `useComboboxStore` have been removed. If you need to compose `Combobox` with `Select` or `Menu`, use the `combobox` prop on `useSelectStore` or `useMenuStore` instead.
