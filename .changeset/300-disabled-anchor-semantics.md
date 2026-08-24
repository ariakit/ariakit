---
"@ariakit/react-components": patch
"@ariakit/react": patch
---

Disabled anchors keep link semantics

Disabled [`Focusable`](https://ariakit.com/reference/focusable) anchors with a statically supplied intrinsic `render={<a />}` now expose link semantics when no `href` is present. Anchors using [`accessibleWhenDisabled`](https://ariakit.com/reference/focusable#accessiblewhendisabled) also receive the explicit tab stop needed to remain keyboard reachable.

This behavior also applies to [`Button`](https://ariakit.com/reference/button) and other Ariakit components when they statically render an intrinsic anchor. Function render callbacks and custom render components keep the existing mount-time element detection because their native element type is not available during server rendering.

```tsx
<Focusable disabled accessibleWhenDisabled render={<a />}>
  Unavailable report
</Focusable>
```
