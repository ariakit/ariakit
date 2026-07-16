---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Dialog`](https://ariakit.com/reference/dialog) and [`Popover`](https://ariakit.com/reference/popover) so descendants can call `event.stopPropagation()` on Escape without hiding the enclosing component. Thanks to [@boaz-wiz](https://github.com/boaz-wiz).
