---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed offscreen [`SelectItem`](https://ariakit.com/reference/select-item) and [`ComboboxItem`](https://ariakit.com/reference/combobox-item) elements to avoid passing non-DOM item props to React DOM nodes, and corrected [`Focusable`](https://ariakit.com/reference/focusable) native disabled handling on supported render targets.
