---
"@ariakit/tailwind": patch
---

Layer lightness limits apply before safe shifts

Fixed `ak-layer-offset-*` and `ak-layer-push-*` utilities to use `ak-layer-min-*` and `ak-layer-max-*` lightness limits on the resolved target before escaping the forbidden mid-luminance range.

When `ak-layer-push-*` and `ak-state-push-*` targets land inside the forbidden range, they now move to the boundary on the other side. Targets that already land outside the forbidden range are left untouched.

`ak-layer-push-*` deltas now stack on top of the `ak-layer-min-*` and `ak-layer-max-*` clamp instead of being partially absorbed by it, so the pushed layer always lands at least the requested distance away from the constrained base.

Layer contrast now uses the bounded pushed layer target, so `ak-layer-contrast` composes with `ak-layer-push-*` instead of ignoring the pushed lightness.
