---
"@ariakit/utils": patch
---

Fixed `getScrollingElement` to resolve the scroll container from the element's own document instead of the top-level page, correcting [`Composite`](https://ariakit.com/reference/composite) keyboard paging and [`Combobox`](https://ariakit.com/reference/combobox) scroll behavior for elements rendered inside a same-origin iframe.
