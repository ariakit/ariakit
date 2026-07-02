---
"@ariakit/components": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Tab`](https://ariakit.com/reference/tab) not becoming the active item on the first [`setSelectedId`](https://ariakit.com/reference/use-tab-store#setselectedid-1) call after a [`SelectPopover`](https://ariakit.com/reference/select-popover) or [`ComboboxPopover`](https://ariakit.com/reference/combobox-popover) containing the tabs opens or toggles.
