---
"@ariakit/tailwind": patch
---

New `ak-frame-backdrop` utility

The new `ak-frame-backdrop` utility makes `ak-frame-bordering-inherit` draw a border. A cover frame stretches by its own border width, so its edge lies on the parent edge, and an inherited ring there would double the translucent parent ring. When the parent edge is a ring, `ak-frame-backdrop` also paints the parent layer beneath the border. When the parent layer matches the surface around the parent, the border then looks like the ring and covers it, even when the cover is lighter or darker than its parent. On a parent border, such as on dark surfaces, it draws a plain border.

```html
<div class="ak-layer ak-frame ak-frame-xl/2 ak-frame-bordering">
  <p>Ring on light surfaces, border on dark ones</p>
  <div
    class="ak-layer ak-layer-lighten-2 ak-frame ak-frame-cover ak-frame-bordering-inherit ak-frame-backdrop ak-edge-inherit"
  ></div>
</div>
```

Use `ak-frame-backdrop-*` to paint another surface beneath the border. On a parent whose layer differs from the surface around it, such as a lightened, darkened, numeric, or color layer, pass that surface, such as `ak-frame-backdrop-(--card-surface)` with `[--card-surface:var(--ak-layer-parent)]` on the parent. Frames that form one shape can share a backdrop the same way. The new `--ak-frame-backdrop` variable holds the surface under each frame edge, so custom edge drawings can paint it under their strokes.
