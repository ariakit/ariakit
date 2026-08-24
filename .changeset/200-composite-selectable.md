---
"@ariakit/components": patch
"@ariakit/react-components": patch
---

Composite selection primitives

The new `createCompositeSelectableStore` and `useCompositeSelectableStore` APIs manage selected item IDs, selection modes, selection behavior, and range selection. `CompositeSelectable` opts individual composite items into selection, while `CompositeSelectableProvider` creates and provides the same store through the matching selection and Composite contexts.

```tsx
import { Composite } from "@ariakit/react-components/composite/composite";
import { CompositeItem } from "@ariakit/react-components/composite/composite-item";
import { CompositeSelectable } from "@ariakit/react-components/composite/composite-selectable";
import { useCompositeSelectableStore } from "@ariakit/react-components/composite/composite-selectable-store";

const store = useCompositeSelectableStore({
  defaultSelectedIds: [],
  selectableBehavior: "replace",
});

<Composite store={store} role="listbox">
  <CompositeItem id="one" role="option" render={<CompositeSelectable />}>
    One
  </CompositeItem>
</Composite>;
```

The agnostic `createCompositeSelectableStore`, `createSelectableMove`, and `SelectableRangeDelegate` exports are available from `@ariakit/components/composite/composite-selectable-store`. A range delegate supplies order and range geometry when a collection is not fully mounted. Both `getKeysInRange` and `getOrderedKeys` are required, and either method can return `null` to refuse an operation it cannot resolve safely. Registered delegates combine ranges only when each endpoint produces a key for its singleton range. A non-selectable endpoint can still anchor a range that one delegate resolves by itself.

`CollectionRenderer` publishes one aggregate delegate for each same-store renderer tree. It follows parent anchors and uses live DOM order for connected branches. Same-anchor branches that are disconnected, cross-document, or unmounted fall back to stable registration order. If a nested renderer can unmount completely, its parent datum must embed the child `items`; otherwise that branch is absent from range and select-all results while unmounted.
