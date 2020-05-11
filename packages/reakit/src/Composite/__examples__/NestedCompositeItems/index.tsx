import * as React from "react";
import {
  unstable_useCompositeState as useCompositeState,
  unstable_Composite as Composite,
  unstable_CompositeItem as CompositeItem,
} from "reakit/Composite";

export default function NestedCompositeItems() {
  const composite = useCompositeState({ loop: true });
  return (
    <Composite {...composite} role="toolbar" aria-label="composite">
      <CompositeItem {...composite} as="div" aria-label="item0">
        <CompositeItem {...composite}>item1</CompositeItem>
        <CompositeItem {...composite}>item2</CompositeItem>
        <CompositeItem {...composite}>item3</CompositeItem>
      </CompositeItem>
    </Composite>
  );
}
