---
"@ariakit/tailwind": patch
---

Fixed `ak-frame` adding a zero-width ring shadow to frames without a ring, which Firefox painted as faint arcs at rounded corners. Only the utilities that set a ring width, such as `ak-frame-ring` and `ak-frame-bordering`, now add the ring shadow.
