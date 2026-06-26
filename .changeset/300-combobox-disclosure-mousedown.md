---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`ComboboxDisclosure`](https://ariakit.com/reference/combobox-disclosure) to honor `event.preventDefault()` in `onMouseDown` before moving focus to the [`Combobox`](https://ariakit.com/reference/combobox) input.
