---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`ComboboxItem`](https://ariakit.com/reference/combobox-item) so non-paste Ctrl/Cmd character shortcuts preserve focus and the combobox value when virtual focus is disabled, while paste shortcuts still route to the input.
