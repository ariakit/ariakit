---
"@ariakit/components": patch
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Fixed the page scrolling when a composite widget presents its active item

Opening a searchable [`Combobox`](https://ariakit.com/reference/combobox) on a scrolled page could move the page, either visibly or as a scroll that was immediately undone, which showed up as an overlay scrollbar flash on macOS. That happened because focus moved into the popup while it was still at its pre-placement origin, so the browser scrolled to where the popup had not been placed yet. The paths that caused it are shared with [`Select`](https://ariakit.com/reference/select) and [`Menu`](https://ariakit.com/reference/menu).

Composite widgets now move DOM focus to the active item without letting the browser scroll, and bring that item into view as a separate step that waits for the popup to be positioned. The page still moves when that is the only way to show the item, which is the case for a [`Composite`](https://ariakit.com/reference/composite) widget that isn't in a popup, or for a popup taller than the viewport.

The presentation is also abandoned when it stops being relevant: when the popup closes, when the user navigates to another item, and, for the presentations that follow focus, when focus moves elsewhere.

[`Dialog`](https://ariakit.com/reference/dialog) applies the same rule to the element it focuses when it opens. It is now brought into view by the shortest scroll that makes it visible, rather than being centered, and on Safari it is brought into view at all when a focus handler immediately moves focus somewhere else. This reaches [`ComboboxSelect`](https://ariakit.com/reference/combobox-select) and [`SelectItem`](https://ariakit.com/reference/select-item), where the selected item is that element: a selected value below the fold of its own list now rests against the edge of the list rather than near its middle.
