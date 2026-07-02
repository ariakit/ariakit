---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Dialog`](https://ariakit.com/reference/dialog), including components built on it such as [`Popover`](https://ariakit.com/reference/popover) and [`Menu`](https://ariakit.com/reference/menu), so focusing, clicking, or right-clicking elements returned by [`getPersistentElements`](https://ariakit.com/reference/dialog#getpersistentelements) no longer closes the dialog before it has received focus, such as when it's rendered with [`autoFocusOnShow`](https://ariakit.com/reference/dialog#autofocusonshow) set to `false`.
