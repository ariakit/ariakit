---
"@ariakit/react": minor
---

`useMenuStore` and `useSelectStore` can now receive a `combobox` prop to combine them with a `Combobox` component. This replaces the old method of passing the result of `useComboboxState` directly as an argument to `useMenuState` and `useSelectState`.

Before:

```jsx
const combobox = useComboboxState();
const menu = useMenuState(combobox);
const select = useSelectState(combobox);
```

After:

```jsx
const combobox = useComboboxStore();
const menu = useMenuStore({ combobox });
const select = useSelectStore({ combobox });
```
