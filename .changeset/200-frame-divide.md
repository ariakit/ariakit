---
"@ariakit/tailwind": patch
---

New `ak-frame-divide` utility

The new `ak-frame-divide` utility draws a border only on the sides of a frame that face a sibling in the parent flow. The first frame omits its start side, and the last frame omits its end side. Use it on a cover frame, such as a dialog footer or a header band, to draw one line between it and the content while the parent edge stays as it is on the other sides.

```html
<div class="ak-layer ak-frame ak-frame-2xl/4 ak-frame-border flex flex-col">
  <p>Body</p>
  <div
    class="ak-layer ak-layer-darken-3 ak-frame ak-frame-cover ak-frame-divide"
  >
    Footer
  </div>
</div>
```

In a parent with `ak-frame-row`, the lines follow the text direction. `ak-frame-divide-*` sets the width, and `ak-frame-divide-inherit` takes the width of the parent frame edge. The cover stretch and the radius of nested frames stay the same, so the corners stay concentric.
