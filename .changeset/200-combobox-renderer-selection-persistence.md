---
"@ariakit/react-components": patch
---

`ComboboxRenderer` limits persistent selected values

`ComboboxRenderer` now keeps at most 32 selected values mounted outside the virtualized window by default. This prevents a large selection from expanding the rendered DOM to include every selected item.

The new `selectedValuePersistenceLimit` prop controls the limit without affecting explicit `persistentIndices`.

```tsx
<ComboboxRenderer selectedValuePersistenceLimit={64} />
```
