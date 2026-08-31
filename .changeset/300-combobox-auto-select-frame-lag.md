---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed the auto-selected item lagging behind the filtered list

Collections now publish their rendered items before the next paint instead of waiting for an animation frame. Until now, state derived from those items could still describe the previous list when the browser painted.

This is most visible in [`Combobox`](https://ariakit.com/reference/combobox) with [`autoSelect`](https://ariakit.com/reference/combobox#autoselect). After typing, the new first option could appear on screen while the previously active option was still highlighted. The same timing applies to every component built on [`CollectionItem`](https://ariakit.com/reference/collection-item), including [`SelectItem`](https://ariakit.com/reference/select-item), [`MenuItem`](https://ariakit.com/reference/menu-item), and [`Tab`](https://ariakit.com/reference/tab).

Thanks to [@ItaiYosephi](https://github.com/ItaiYosephi) for reporting the issue.
