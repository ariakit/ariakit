import * as Ariakit from "@ariakit/react";
import "./style.css";

export default function Example() {
  const collection = Ariakit.useCollectionStore();
  const length = Ariakit.useStoreState(
    collection,
    (state) => state.renderedItems.length,
  );
  return (
    <Ariakit.Collection store={collection} className="collection">
      <div>Items count: {length}</div>
      <Ariakit.CollectionItem>🍎 Apple</Ariakit.CollectionItem>
      <Ariakit.CollectionItem>🍇 Grape</Ariakit.CollectionItem>
      <Ariakit.CollectionItem shouldRegisterItem={false}>
        🍊 Orange
      </Ariakit.CollectionItem>
    </Ariakit.Collection>
  );
}
