---
"@ariakit/tailwind": patch
---

Fixed `ak-layer-offset-*` and `ak-layer-push-*` utilities to use `ak-layer-min-*` and `ak-layer-max-*` lightness limits before escaping the forbidden mid-luminance range and applying high-contrast adjustments.
