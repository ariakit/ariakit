---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover) to honor consumer-provided [`getPersistentElements`](https://ariakit.com/reference/dialog#getpersistentelements) callbacks, so interacting with the returned elements no longer dismisses a non-modal popover. Thanks to [@georgekaran](https://github.com/georgekaran).
