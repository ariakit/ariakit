---
"@ariakit/tailwind": patch
---

Inert layer longhands no longer mark a color change

`ak-layer-mix-color-*`, `ak-layer-mix-amount-*`, and `ak-layer-mix-method-*` only fill in values that the mixing utilities read, and `ak-layer-contrast-*` only fills in the amount that `ak-layer-contrast` reads. Without that partner on the same element, the resolved layer color never moves.

They were still marked as color changes, and that mark is also what makes `ak-layer-transparent` paint. So a nested layer carrying only these longhands reapplied the global contrast bias instead of inheriting its parent color whenever `--contrast` was above `0`, and, with `ak-layer-transparent`, it would have painted a background instead of staying see-through.

```tsx
<div className="ak-layer">
  {/* Inherits the parent color, like a bare ak-layer */}
  <div className="ak-layer ak-layer-mix-color-red-500" />
  <div className="ak-layer ak-layer-contrast-50" />
  {/* Still moves the color, and still counts as a color change */}
  <div className="ak-layer ak-layer-mix ak-layer-mix-color-red-500" />
  <div className="ak-layer ak-layer-contrast ak-layer-contrast-50" />
</div>
```
