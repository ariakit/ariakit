---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed rendering many [`Menu`](https://ariakit.com/reference/menu) components on the same page potentially causing a "Maximum update depth exceeded" error. [`MenuItem`](https://ariakit.com/reference/menu-item) elements now register only while the menu is visible, instead of registering on mount even while it's hidden.
