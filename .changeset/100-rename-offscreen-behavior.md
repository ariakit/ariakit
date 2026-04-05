---
"@ariakit/react-core": patch
---

Renamed `offscreenBehavior` to `offscreenMode`

**BREAKING** if you're using the `offscreenBehavior` prop on collection or composite item offscreen components.

The `offscreenBehavior` prop has been renamed to `offscreenMode` for consistency.

Before:

```tsx
<ComboboxItem offscreenBehavior="lazy" />
```

After:

```tsx
<ComboboxItem offscreenMode="lazy" />
```
