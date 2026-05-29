---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed rendering many [`Menu`](https://ariakit.com/reference/menu) components on the same page potentially causing a "Maximum update depth exceeded" error. [`MenuItem`](https://ariakit.com/reference/menu-item) elements are now registered while the menu is open instead of while it's hidden.
