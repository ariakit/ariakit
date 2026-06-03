---
"@ariakit/react-components": patch
---

Offscreen item placeholders omit internal props

Fixed offscreen [`SelectItem`](https://ariakit.com/reference/select-item) and [`ComboboxItem`](https://ariakit.com/reference/combobox-item) elements to avoid passing item and focus props to inactive placeholder DOM nodes.

Inactive offscreen placeholders rely on `aria-disabled`. Custom render elements own any native `disabled` state they need.
