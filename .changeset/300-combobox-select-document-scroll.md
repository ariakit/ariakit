---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed a select [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover) with a [`Combobox`](https://ariakit.com/reference/combobox) inside writing to the document scroll position when opened, which could briefly reveal overlay scrollbars on macOS.
