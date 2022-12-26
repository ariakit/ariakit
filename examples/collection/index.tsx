import { Collection, CollectionItem, useCollectionStore } from "@ariakit/react";
import "./style.css";

export default function Example() {
  const collection = useCollectionStore();
  const length = collection.useState((state) => state.renderedItems.length);
  return (
    <Collection store={collection} className="collection">
      <div>Items count: {length}</div>
      <CollectionItem key="apple">🍎 Apple</CollectionItem>
      <CollectionItem key="grape">🍇 Grape</CollectionItem>
      <CollectionItem key="orange">🍊 Orange</CollectionItem>
    </Collection>
  );
}
