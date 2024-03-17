---
"@ariakit/core": patch
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Combobox `autoFocusOnHide` behavior

Previously, the [`autoFocusOnHide`](https://ariakit.org/reference/combobox-popover#autofocusonhide) feature on [`ComboboxPopover`](https://ariakit.org/reference/combobox-popover) was turned off by default. Most of the time, this didn't have any practical impact because the combobox input element was already focused when the popover was hidden.

Now, this feature is enabled by default and should work consistently even when [`virtualFocus`](https://ariakit.org/reference/combobox-provider#virtualfocus) is set to `false`.
