---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Fixed [`Combobox`](https://ariakit.org/reference/combobox) input scroll position resetting when search results change

When a [`Combobox`](https://ariakit.org/reference/combobox) input's text overflows its width and items are filtered asynchronously (e.g., via `startTransition`), the input's horizontal scroll position was being reset to the beginning each time results changed. This was caused by the virtual focus mechanism briefly moving DOM focus to the active item and back, which made browsers reset the input's internal `scrollLeft`. The scroll position is now preserved across these focus transitions.
