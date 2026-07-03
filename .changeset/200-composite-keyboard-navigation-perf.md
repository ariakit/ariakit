---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Faster keyboard navigation on composite widgets

Moving through items with arrow keys no longer re-renders the [`Composite`](https://ariakit.com/reference/composite) component itself when using roving tabindex.

This reduces the scripting cost of each keystroke on large collections and benefits everything built on composite widgets, such as [`Menu`](https://ariakit.com/reference/menu), [`Combobox`](https://ariakit.com/reference/combobox), [`Toolbar`](https://ariakit.com/reference/toolbar), and [`Tab`](https://ariakit.com/reference/tab).
