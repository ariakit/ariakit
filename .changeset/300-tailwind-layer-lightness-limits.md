---
"@ariakit/tailwind": patch
---

Layer lightness limits apply before safe shifts

Fixed `ak-layer-offset-*` and `ak-layer-push-*` utilities to use `ak-layer-min-*` and `ak-layer-max-*` lightness limits on the resolved target before escaping the forbidden mid-luminance range.

When `ak-layer-push-*` and `ak-state-push-*` targets land inside the forbidden range, they now move to the boundary on the other side. Targets that already land outside the forbidden range are left untouched.

Zero-value `ak-layer-push-*` and `ak-state-push-*` utilities now also activate this push behavior; only the push distance is zero.

Layer contrast now uses the bounded pushed layer target, so `ak-layer-contrast` composes with `ak-layer-push-*` instead of ignoring the pushed lightness.
