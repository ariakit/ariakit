---
"@ariakit/components": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Added `ComboboxSelect` for rendering a select-like combobox disclosure that displays the current [`selectedValue`](https://ariakit.com/reference/combobox-provider#selectedvalue) state, and exposed `labelElement` and `selectElement` on the combobox store for select-like combobox integrations.

When a `ComboboxSelect` is present, other combobox components adjust their behavior accordingly:

- [`Combobox`](https://ariakit.com/reference/combobox) no longer registers itself as the popover anchor, so the popover is positioned relative to the `ComboboxSelect` button.
- [`ComboboxItem`](https://ariakit.com/reference/combobox-item) no longer sets the combobox input value on click, resets the input value when an item is selected, renders the `aria-selected` attribute on selected items, and moves the highlight to hovered items while the popup is open.
- [`ComboboxLabel`](https://ariakit.com/reference/combobox-label) labels the `ComboboxSelect` button and focuses it on click instead of using the `htmlFor` attribute.
- [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover) takes focus when it opens, returns focus to the `ComboboxSelect` button when it hides, and is labeled by the `ComboboxLabel` component.
