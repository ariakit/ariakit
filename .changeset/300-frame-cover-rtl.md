---
"@ariakit/tailwind": patch
---

Frame covers support RTL rows

Fixed `ak-frame-cover` to apply stretch margins and corner rounding to the correct logical sides in RTL rows.

Since `ak-frame-cover` now uses logical CSS properties, override its stretch margin with axis or side utilities such as `mx-*`, `my-*`, `ms-*`, or `me-*` instead of the bare `m-*` shorthand on the same element. Covers should also inherit their frame's `dir` and `writing-mode`; apply direction changes inside the cover when the content needs a different flow.
