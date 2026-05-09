---
"@ariakit/tailwind": patch
---

Layer lightness limits apply before safe shifts

Fixed `ak-layer-offset-*` and `ak-layer-push-*` utilities to use `ak-layer-min-*` and `ak-layer-max-*` lightness limits before escaping the forbidden mid-luminance range.

When `ak-layer-push-*` and `ak-state-push-*` targets land inside the forbidden range, they now move to the boundary on the other side. Targets that already land outside the forbidden range are left untouched.
