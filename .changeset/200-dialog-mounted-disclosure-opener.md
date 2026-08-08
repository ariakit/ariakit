---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Changed [`Dialog`](https://ariakit.com/reference/dialog) and components built on it, such as [`Popover`](https://ariakit.com/reference/popover) and [`Menu`](https://ariakit.com/reference/menu), to keep a mounted [`PopoverDisclosure`](https://ariakit.com/reference/popover-disclosure) or similar trigger as the opener when shown programmatically, instead of the element that happened to have focus.
