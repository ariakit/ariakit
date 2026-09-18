---
"@ariakit/tailwind": patch
---

Ink inherits through nested layers

The opacity that `ak-ink-*` requests now inherits. An `ak-layer` inside dimmed text keeps that ink and recomputes the readable floor against its own background, instead of resetting its text to full strength. An icon or a badge inside a dimmed button now dims with the button.

This changes how existing markup renders when an `ak-layer` sits inside an element with `ak-ink-*`. Add `ak-ink-100` to a nested layer that must keep full-strength text.

```html
<div class="ak-layer ak-ink-70">
  <span class="ak-layer ak-layer-primary">Still 70% ink</span>
  <span class="ak-layer ak-layer-primary ak-ink-100">Full ink</span>
</div>
```
