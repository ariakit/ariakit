---
"@ariakit/core": patch
"@ariakit/react-core": patch
"@ariakit/react": patch
---

[`#2785`](https://github.com/ariakit/ariakit/pull/2785) Added `parent` and `menubar` props to the menu store. These props will be automatically set when rendering nested menus or menus inside a menubar.

However, it now supports rendering nested menus that aren't nested in the React tree, in which case you would have to provider the parent menu store manually to the child menu store.

Those props will also be included in the returned menu store object so you can check them to see if the menu is nested or not. For example:

```jsx
const menu = useMenuStore(props);
const isNested = Boolean(menu.parent);
```
