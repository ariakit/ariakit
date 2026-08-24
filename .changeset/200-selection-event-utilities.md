---
"@ariakit/utils": patch
---

Selection event and ARIA utilities

`@ariakit/utils` now exports `isRangeSelectionEvent`, `isAdditiveSelectionEvent`, `isNonContiguousSelectionEvent`, and `isVirtualClick` to classify selection gestures across pointer and keyboard activation.

```ts
const range = isRangeSelectionEvent(event);
const additive = isAdditiveSelectionEvent(event);
```

The new `supportsAriaMultiselectable` and `getSelectionAttributeByRole` functions identify roles that support `aria-multiselectable` and the selected-state attribute for an item role.
