---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`CompositeItem`](https://ariakit.com/reference/composite-item) crashing with `Cannot access 'rowId' before initialization` when rendered inside a [`CompositeRow`](https://ariakit.com/reference/composite-row) — or a derived row component such as [`SelectRow`](https://ariakit.com/reference/select-row) or [`ComboboxRow`](https://ariakit.com/reference/combobox-row) — that receives the `aria-posinset` prop.
