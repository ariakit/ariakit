---
"@ariakit/components": patch
---

Fixed disclosure stores setting the [`open`](https://ariakit.com/reference/use-disclosure-store#open) state to `false` before a framework `Dialog` could prevent a close requested through [`hide`](https://ariakit.com/reference/use-disclosure-store#hide), [`setOpen`](https://ariakit.com/reference/use-disclosure-store#setopen-1), or [`toggle`](https://ariakit.com/reference/use-disclosure-store#toggle). This applies to all stores built on the disclosure store, such as the dialog and combobox stores.
