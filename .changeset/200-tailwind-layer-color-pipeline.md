---
"@ariakit/tailwind": patch
---

Improved `ak-layer`, `ak-edge`, and `ak-text` style recalculation performance

Layer and edge colors now resolve fewer intermediate colors per element. In browsers that support the CSS `if()` function, `ak-text` delivers its quantized lightness table as four conditional declarations instead of one rule per quantized step, which removes most of its selector matching work — especially under child variants such as `*:ak-text`.
