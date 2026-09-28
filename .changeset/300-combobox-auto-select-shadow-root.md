---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Combobox`](https://ariakit.com/reference/combobox) inside a shadow root not activating the first item when typing with [`autoSelect`](https://ariakit.com/reference/combobox#autoselect) enabled, so pressing <kbd>Enter</kbd> submitted the typed text instead of the first match. This also applies to [`ComboboxInput`](https://ariakit.com/reference/combobox-input).
