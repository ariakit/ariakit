---
"@ariakit/utils": patch
---

Fixed `getScrollingElement` to resolve the scroll container from the element's own document instead of the top-level page, so scroll-aware behavior works correctly for elements rendered inside a same-origin iframe.
