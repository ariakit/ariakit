---
"@ariakit/tailwind": patch
---

Adjusted edge color rendering in `@ariakit/tailwind` to preserve chroma-aware alpha blending for edge utilities so border and ring output remains consistent with intended contrast and saturation behavior, including when using `ak-edge`, `ak-edge-shadow`, and mixed layer color scenarios.
