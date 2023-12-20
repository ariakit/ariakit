---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Modal Combobox

The [Combobox](https://ariakit.org/component/combobox) components now support the [`modal`](https://ariakit.org/reference/combobox-popover#modal) prop on [`ComboboxPopover`](https://ariakit.org/reference/combobox-popover).

When a modal combobox is expanded, users can interact with and tab through all the combobox controls, including [`Combobox`](https://ariakit.org/reference/combobox), [`ComboboxDisclosure`](https://ariakit.org/reference/combobox-disclosure), and [`ComboboxCancel`](https://ariakit.org/reference/combobox-cancel), even if they're rendered outside the popover. The rest of the page will be inert.
