---
"@ariakit/react-core": patch
"@ariakit/react": patch
---

Fixed `Combobox` input scroll position resetting

When a [`Combobox`](https://ariakit.org/reference/combobox) input's text overflowed its width, the input's horizontal scroll position reset to the beginning each time the results changed. This happened because the virtual focus mechanism briefly moved DOM focus to the active item and back when [`autoSelect`](https://ariakit.org/reference/combobox#autoselect) was enabled, causing browsers to reset the input's internal `scrollLeft`.

The scroll position is now preserved across these focus transitions.
