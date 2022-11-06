import {
  Collection,
  CollectionItem,
  useCollectionStore,
} from "ariakit/collection/store";
import "./style.css";

export default function Example() {
  const collection = useCollectionStore();
  const length = collection.useState((state) => state.renderedItems.length);
  return (
    <Collection store={collection} className="collection">
      <div>Items count: {length}</div>
      <CollectionItem>🍎 Apple</CollectionItem>
      <CollectionItem>🍇 Grape</CollectionItem>
      <CollectionItem>🍊 Orange</CollectionItem>
    </Collection>
  );
}
