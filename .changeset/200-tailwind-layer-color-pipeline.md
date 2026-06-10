---
"@ariakit/tailwind": patch
---

Improved style recalculation performance of `ak-layer`, `ak-edge`, and `ak-text`. Layer and edge colors resolve fewer intermediate colors per element, and in browsers that support the CSS `if()` function, `ak-text` delivers its quantized lightness table as four conditional declarations instead of one rule per quantized step, which removes most of its selector matching work — especially under child variants such as `*:ak-text`.
