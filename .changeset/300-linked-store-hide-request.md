---
"@ariakit/components": patch
---

Fixed stores linked through the [`disclosure`](https://ariakit.com/reference/use-disclosure-store#disclosure), [`popover`](https://ariakit.com/reference/use-popover-store#popover), or [`combobox`](https://ariakit.com/reference/use-menu-store#combobox) options setting the [`open`](https://ariakit.com/reference/use-disclosure-store#open) state to `false` before a framework `Dialog` rendered with the linked store could prevent a close requested on the other store. This applies to all stores built on the disclosure store, such as the dialog, combobox, and menu stores.
