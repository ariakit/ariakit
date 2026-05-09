---
"@ariakit/tailwind": patch
---

Removed `ak-layer-invert`

**BREAKING** if you're using the `ak-layer-invert` utility.

The `ak-layer-invert` utility has been removed. Use the `ak-layer-l-*` utility with a raw expression and the `ak-layer-min-*` lightness clamp instead.

Before:

```tsx
<div className="ak-layer ak-layer-invert" />
```

After:

```tsx
<div className="ak-layer ak-layer-l-[calc(1-l)] ak-layer-min-25" />
```
