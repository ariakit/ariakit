---
"@ariakit/tailwind": patch
---

New `ak-edge-contrast` utility

The new `ak-edge-contrast` utility keeps an edge at 3:1 or more against the parent layer, which is the contrast that WCAG asks for the boundary of a control such as a text field. The floor aims 2.5% over the ratio, and an edge with a color that already reaches that keeps its color.

```html
<input
  class="ak-layer ak-layer-lighten-6 ak-frame ak-frame-field/field ak-frame-border ak-edge-contrast"
/>
<input
  class="ak-layer ak-layer-lighten-6 ak-frame ak-frame-field/field ak-frame-border ak-edge-warning ak-edge-raw ak-edge-contrast"
/>
```

With the default push, a neutral edge becomes plain black or white and raises its alpha. An edge with a color becomes solid and moves its lightness toward the floor. The `contrast-more` variant raises the floor to 4.5:1, and `ak-disabled` lowers it to 1.5:1 by default. The [README](https://github.com/ariakit/ariakit/blob/main/packages/ariakit-tailwind/readme.md#contrast-floor) describes the cases that the floor doesn't cover.
