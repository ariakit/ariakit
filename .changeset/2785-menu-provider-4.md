---
"@ariakit/core": patch
"@ariakit/react-core": patch
"@ariakit/react": patch
---

[`#2785`](https://github.com/ariakit/ariakit/pull/2785) Added `parent` and `menubar` properties to the menu store. These properties are automatically set when rendering nested menus or menus within a menubar.

Now, it also supports rendering nested menus that aren't nested in the React tree. In this case, you would have to supply the parent menu store manually to the child menu store.

These properties are also included in the returned menu store object, allowing you to verify whether the menu is nested. For instance:

```jsx
const menu = useMenuStore(props);
const isNested = Boolean(menu.parent);
```
