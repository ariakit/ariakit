---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Dialog`](https://ariakit.com/reference/dialog), and every component built on it such as [`Popover`](https://ariakit.com/reference/popover) and [`Menu`](https://ariakit.com/reference/menu), recreating its contents when the [`backdrop`](https://ariakit.com/reference/dialog#backdrop) prop changed between a falsy and a truthy value.
