---
"@ariakit/tailwind": patch
---

New `ak-edge-contrast` utility

The new `ak-edge-contrast` utility keeps an edge at 3:1 or more against the parent layer, which is the contrast that WCAG asks for the boundary of a control such as a text field. An edge that already reaches the floor doesn't change.

```html
<input
  class="ak-layer ak-layer-lighten-6 ak-frame ak-frame-field/field ak-frame-border ak-edge-contrast"
/>
<input
  class="ak-layer ak-layer-lighten-6 ak-frame ak-frame-field/field ak-frame-border ak-edge-warning ak-edge-raw ak-edge-contrast"
/>
```

A neutral edge, without `ak-edge-<color>`, raises only its alpha. An edge with a color becomes solid, keeps its chroma and hue, and moves its lightness only as far as the floor requires. The `contrast-more` variant raises the floor to 4.5:1, and `ak-disabled` lowers it to 1.5:1 by default.
