---
"@ariakit/react": minor
---

Replaced state hooks (e.g., `useComboboxState`) with component stores (e.g., `useComboboxStore`).

Before:

```jsx
const combobox = useComboboxState({ defaultValue: "value" });
const value = combobox.value;

<Combobox state={combobox} />;
```

After:

```jsx
const combobox = useComboboxStore({ defaultValue: "value" });
const value = combobox.useState("value");

<Combobox store={combobox} />;
```

This change applies to all state hooks, not just combobox, and has some API differences. Please, refer to the TypeScript definitions for more information. Learn more about the motivation behind this change in the [RFC](https://github.com/ariakit/ariakit/issues/1875).
