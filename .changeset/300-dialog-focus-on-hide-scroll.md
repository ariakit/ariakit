---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Clicking outside no longer restores focus to the disclosure element

[`Dialog`](https://ariakit.com/reference/dialog) and components that extend it (such as [`Menu`](https://ariakit.com/reference/menu) and [`Popover`](https://ariakit.com/reference/popover)) no longer restore focus to the disclosure element when the dialog is closed by clicking or right-clicking outside. This aligns with native HTML `<dialog>` and `popover` behavior where trigger buttons don't receive focus when you interact outside.

Focus is still restored normally when the dialog is closed by other means, such as pressing Escape, selecting a menu item, or calling `store.hide()` programmatically. In these cases the disclosure element is now focused with default browser scrolling instead of `preventScroll`.
