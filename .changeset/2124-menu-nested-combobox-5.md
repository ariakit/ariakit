---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Custom submenu auto focus

When opening nested [Menu](https://ariakit.org/components/menu) components with <kbd>Enter</kbd>, <kbd>Space</kbd>, or arrow keys, the first tabbable element will now receive focus, even if it's not a [`MenuItem`](https://ariakit.org/reference/menu-item) element. This should enable custom popups that behave like submenus, but use different semantics.
