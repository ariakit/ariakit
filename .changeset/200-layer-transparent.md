---
"@ariakit/tailwind": patch
---

Added `ak-layer-transparent`

The `ak-layer` utility always paints its resolved color. Against the parent layer that paint is invisible, but it is still opaque, so a control that opens a layer only to give its descendants a color context covers whatever is drawn behind it, such as a moving highlight at a negative z-index.

The new `ak-layer-transparent` utility makes that paint conditional. The element paints nothing at rest, and paints the layer color as soon as a modifier applies one, including under a variant such as `hover:` or `aria-selected:`.

```tsx
<button className="ak-layer ak-layer-transparent hover:ak-state-10">
  Transparent at rest, painted on hover
</button>
```
