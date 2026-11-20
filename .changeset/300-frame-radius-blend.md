---
"@ariakit/tailwind": patch
---

Smoother nested `ak-frame` radius between `0.5rem` and `1rem`

A nested `ak-frame` took the concentric radius until it was `1rem` from the parent edge, and its declared radius from there. When the distance was larger than the parent radius, the concentric radius was the `0.125em` minimum. Thus, a frame was almost square just before it became fully round.

Between `0.5rem` and `1rem` from the parent edge, the radius now goes in a straight line from the concentric radius at `0.5rem` to the declared radius at `1rem`. If the declared radius is the smaller of the two, the frame keeps the concentric radius until that radius is equal to the declared radius. Frames in this range can become rounder, and a frame with a full declared radius, such as `ak-frame-rounded-full`, is a pill in this range. Frames up to `0.5rem` from the parent edge do not change, and neither do frames whose concentric radius is larger than their declared radius.

```html
<div class="ak-frame ak-frame-xl/3.5">
  <!-- Before: 0.125em. After: 0.625rem. At ak-frame-xl/4: 0.75rem -->
  <div class="ak-frame ak-frame-xl"></div>
</div>
```

Add `ak-frame-force` to a nested frame to use its declared radius at each distance.

This update also fixes a frame in a parent with a full radius, such as `ak-frame-rounded-full`. In Firefox and Safari, that frame stayed a pill at `1rem` or more from the parent edge. It now takes its declared radius there, as in Chrome.
