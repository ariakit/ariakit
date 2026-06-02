---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed offscreen [`SelectItem`](https://ariakit.com/reference/select-item) and [`ComboboxItem`](https://ariakit.com/reference/combobox-item) elements to avoid passing item and focus props to inactive placeholder DOM nodes. Inactive offscreen placeholders rely on `aria-disabled`; custom render elements own any native `disabled` state they need.
