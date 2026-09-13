---
"@ariakit/tailwind": patch
---

Disabled contrast utility

The new `ak-disabled` utility applies the same contrast settings as a disabled attribute. Use it on a control surface that does not carry the attribute, such as a file input's label. Descendant layers and text inherit the settings.

```tsx
<label className="ak-layer ak-disabled ak-ink-0">
  <input type="file" disabled className="sr-only" />
  Upload attachment
</label>
```
