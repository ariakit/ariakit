---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed a [`Popover`](https://ariakit.com/reference/popover) staying open when the user clicks inside a non-modal [`Dialog`](https://ariakit.com/reference/dialog) that was already in the page when the popover opened, after React replaces the dialog element while both are open. This applies to all components built on [`Dialog`](https://ariakit.com/reference/dialog), such as [`Menu`](https://ariakit.com/reference/menu).
