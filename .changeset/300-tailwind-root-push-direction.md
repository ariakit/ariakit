---
"@ariakit/tailwind": patch
---

Fixed `ak-layer-push-*` and `ak-state-push-*` in `@ariakit/tailwind` to escape the forbidden lightness band based on the current layer, regardless of the parent layer.
