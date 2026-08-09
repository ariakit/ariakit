---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Focusable`](https://ariakit.com/reference/focusable) components, including [`CompositeItem`](https://ariakit.com/reference/composite-item) and [`ToolbarItem`](https://ariakit.com/reference/toolbar-item), not receiving [`data-focus-visible`](https://ariakit.com/guide/styling#data-focus-visible) on modified navigation keys such as `Alt+ArrowDown` between composite items or `Ctrl+Home` on a grid.
