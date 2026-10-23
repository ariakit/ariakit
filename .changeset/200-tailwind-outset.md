---
"@ariakit/tailwind": patch
---

New `ak-outset` utility

The new `ak-outset` utility makes an element take its color context from the layer around its parent layer. Use it on an element that paints outside its parent's box, such as a bar below a selected tab, so it adapts to the surface behind it instead of its parent. It applies to `ak-layer` and its modifiers, including `ak-layer-mix` and `ak-layer-contrast`, and to `ak-text` and `ak-outline` on the same element.

```html
<div class="ak-layer ak-layer-canvas">
  <button
    class="ak-layer ak-layer-primary relative ak-frame ak-frame-field/field"
  >
    Selected tab
    <span
      class="ak-layer ak-layer-contrast ak-outset absolute inset-x-0 -bottom-2 h-0.5"
    ></span>
  </button>
</div>
```

Put `ak-outset` on a direct child of an `ak-layer` element. Its descendants keep measuring from their own parent layer.
