---
"@ariakit/tailwind": patch
---

Shared borders for adjacent frames

Use `ak-frame-join` with `ak-frame-join-item` children to draw one edge between adjacent surfaces. It supports rows, columns, RTL, frame borders, and outside rings. Apply `ak-frame-join-active` through hover or selection variants to give an item ownership of its neighboring edges. These utilities also work through `@apply` in custom CSS classes.

Native border joins require the browser's rendered width to match the declared width. Pixel rounding can break that alignment for fractional widths and at some zoom levels. Use frame rings for fractional edges.

```tsx
<div className="ak-frame ak-frame-row ak-frame-join flex">
  <button className="ak-layer ak-frame ak-frame-lg/2 ak-frame-border ak-frame-join-item hover:ak-frame-join-active">
    Day
  </button>
  <button className="ak-layer ak-frame ak-frame-lg/2 ak-frame-border ak-frame-join-item hover:ak-frame-join-active">
    Week
  </button>
</div>
```
