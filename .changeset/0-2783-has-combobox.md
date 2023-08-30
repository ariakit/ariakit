---
"@ariakit/react-core": minor
"@ariakit/react": minor
---

[`#2783`](https://github.com/ariakit/ariakit/pull/2783) **BREAKING** *(This should affect very few people)*: The `combobox` state on `useSelectStore` has been replaced by the `combobox` property on the store object.

**Before:**

```js
const combobox = useComboboxStore();
const select = useSelectStore({ combobox });
const hasCombobox = select.useState("combobox");
```

**After:**

```js
const combobox = useComboboxStore();
const select = useSelectStore({ combobox });
const hasCombobox = Boolean(select.combobox);
```

In the example above, `select.combobox` is literally the same as the `combobox` store. It will be defined if the `combobox` store is passed to `useSelectStore`.
