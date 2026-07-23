---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Dialog`](https://ariakit.com/reference/dialog) and components built on it, such as [`Popover`](https://ariakit.com/reference/popover) and [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover), so interacting with elements returned by [`getPersistentElements`](https://ariakit.com/reference/dialog#getpersistentelements) across open shadow roots no longer closes the component before it receives focus.
