---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

`ComboboxSelect` popup focus and selection

[`ComboboxSelect`](https://ariakit.com/reference/combobox-select) now keeps keyboard moves made while its [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover) is still positioning. When nothing is selected, opening the popup no longer moves focus to an earlier element such as [`ComboboxDismiss`](https://ariakit.com/reference/combobox-dismiss). A popup with [`portal`](https://ariakit.com/reference/combobox-popover#portal) also opens without activating its first item in this case.

The selected item is now centered when the popup opens again, including when the focused select opens a popup with [`autoFocusOnShow`](https://ariakit.com/reference/combobox-popover#autofocusonshow) set to `false`, or when the same store is passed to [`ComboboxProvider`](https://ariakit.com/reference/combobox-provider) and to only one of [`ComboboxSelect`](https://ariakit.com/reference/combobox-select) or [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover).

[`resetOnEscape`](https://ariakit.com/reference/combobox-popover#resetonescape) now restores the correct selected value when an arrow key opens the popup, or when typing on the closed select changes the value before the popup opens.
