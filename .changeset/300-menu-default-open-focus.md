---
"@ariakit/components": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed the focus behavior of [`Menu`](https://ariakit.com/reference/menu) when it's rendered already open, for example with [`defaultOpen`](https://ariakit.com/reference/menu-provider#defaultopen): focus now moves to the menu container with no item highlighted, in both non-modal menus, which previously left focus alone, and modal menus, which previously focused the first item. Thanks to [@ciampo](https://github.com/ciampo).
