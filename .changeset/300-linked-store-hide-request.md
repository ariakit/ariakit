---
"@ariakit/components": patch
---

Fixed a close requested on a store passed through the [`popover`](https://ariakit.com/reference/use-popover-store#popover) or [`combobox`](https://ariakit.com/reference/use-menu-store#combobox) options, or on a store that receives another one through the [`disclosure`](https://ariakit.com/reference/use-disclosure-store#disclosure) option, setting the [`open`](https://ariakit.com/reference/use-disclosure-store#open) state to `false` before a framework `Dialog` rendered with the other store could prevent it. This applies to all stores built on the disclosure store, such as the dialog, combobox, and menu stores.
