---
"@ariakit/utils": patch
---

Fixed `getClosestFocusable` freezing the page in an infinite loop when walking up from an element that matched the focusable selector but was not actually focusable, such as a box-less `display: contents` element (reachable through `TagList`'s click handler).
