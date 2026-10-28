---
"@ariakit/tailwind": patch
---

New `ak-layer-fade-*` utility

The new `ak-layer-fade-*` utilities fade a layer toward the parent layer after the lightness offset, push, and bounds. Use them for a surface whose lightness comes from a push, such as an inverted surface. `ak-layer-mix-*` applies before the push, so it can't fade a push that always reaches its bound.

```html
<button
  class="ak-layer ak-layer-push-100 ak-layer-min-l-23 ak-layer-max-l-96 ak-layer-fade-80"
>
  Vote
</button>
```

When a layer with a lightness offset or push fades into the forbidden mid-lightness range, it stays on the far side of the range from the parent layer, so it remains distinct from a mid-tone parent layer.
