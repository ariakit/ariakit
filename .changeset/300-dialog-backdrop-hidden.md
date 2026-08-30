---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed the element rendered by the [`backdrop`](https://ariakit.com/reference/dialog#backdrop) prop on [`Dialog`](https://ariakit.com/reference/dialog), and every component built on it such as [`Popover`](https://ariakit.com/reference/popover) and [`Menu`](https://ariakit.com/reference/menu), never receiving the `hidden` attribute while it was hidden.
