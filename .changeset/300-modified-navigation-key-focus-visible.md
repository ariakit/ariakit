---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed [`Focusable`](https://ariakit.com/reference/focusable) treating the keys that move composite focus as a pointer interaction when a modifier was held, so components built on it such as [`CompositeItem`](https://ariakit.com/reference/composite-item) and [`ToolbarItem`](https://ariakit.com/reference/toolbar-item) now receive [`data-focus-visible`](https://ariakit.com/guide/styling#data-focus-visible) when focus reaches them that way. Arrow keys and `Home`, `End`, `PageUp`, and `PageDown` move focus through a composite whether or not a modifier is held, including `Ctrl+Home` and `Ctrl+End` on a grid, so they now count as keyboard navigation. This applies to every [`Focusable`](https://ariakit.com/reference/focusable) component, not only composite items.
