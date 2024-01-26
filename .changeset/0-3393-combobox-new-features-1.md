---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

New `autoSelect` mode

The [`autoSelect`](https://ariakit.org/reference/combobox#autoselect) prop of the [`Combobox`](https://ariakit.org/reference/combobox) component now accepts a new `"always"` value:

```jsx
<Combobox autoSelect="always" />
```

When using this value, the first enabled item will automatically gain focus when the list shows up, as well as when the combobox input value changes (which is the behavior of the [`autoSelect`](https://ariakit.org/reference/combobox#autoselect) prop when set to `true`).
