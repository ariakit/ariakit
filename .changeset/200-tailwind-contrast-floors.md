---
"@ariakit/tailwind": patch
---

Contrast floors for edges and layers

Two utilities now keep a color at 3:1 or more against the parent layer, which is the contrast that WCAG asks for the boundary of a control and its state. A floor aims 2.5% over its ratio, and a color that already reaches that keeps its color. The `contrast-more` variant raises 3:1 to 4.5:1, and `ak-disabled` lowers it to 1.5:1 by default.

- **New `ak-edge-contrast` utility.** It keeps an edge at 3:1, such as the border of a text field. With the default push, a neutral edge becomes plain black or white and raises its alpha. An edge with a color becomes solid and moves its lightness toward the floor.

- **`ak-layer-contrast` keeps its resting color at 3:1.** It still moves the lightness away from the parent layer, now by `30` instead of `25` by default, and then moves a color that is still short of 3:1, such as the fill of a checked checkbox on a brand surface. State utilities, such as `hover:ak-state-6`, apply on top of the resting color and can move it under the ratio. A color that has to move can land well over the ratio, because a layer skips the mid-lightness range. The amount now sets the ratio, and each further `30` multiplies it by 3, so `ak-layer-contrast-41` keeps about 4.5:1. Lower amounts, such as `ak-layer-contrast-10`, separate a surface without the 3:1 guarantee. A translucent layer with `ak-layer-contrast` becomes opaque.

```html
<input
  class="ak-layer ak-layer-lighten-6 ak-frame ak-frame-field/field ak-frame-border ak-edge-contrast"
/>
<input
  class="ak-layer ak-layer-lighten-6 ak-frame ak-frame-field/field ak-frame-border ak-edge-warning ak-edge-raw ak-edge-contrast"
/>
<div class="ak-layer ak-layer-primary">
  <input type="checkbox" class="ak-layer ak-layer-primary ak-layer-contrast" />
</div>
```

The README describes the cases that the [edge floor](https://github.com/ariakit/ariakit/blob/main/packages/ariakit-tailwind/readme.md#contrast-floor) and the [layer floor](https://github.com/ariakit/ariakit/blob/main/packages/ariakit-tailwind/readme.md#layer-contrast-floor) don't cover.
