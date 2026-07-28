---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed disabled [`Select`](https://ariakit.com/reference/select) and [`ComboboxSelect`](https://ariakit.com/reference/combobox-select) controls so their values are omitted from form submission when [`accessibleWhenDisabled`](https://ariakit.com/reference/focusable#accessiblewhendisabled) is used or the visible control is rendered with an element that doesn't support the native `disabled` attribute. Thanks to [@georgekaran](https://github.com/georgekaran).
