import {
  Collection,
  CollectionItem,
  useCollectionState,
} from "ariakit/collection";
import "./style.css";

export default function Example() {
  const collection = useCollectionState();
  return (
    <Collection state={collection} className="collection">
      <div>Items count: {collection.items.length}</div>
      <CollectionItem>🍎 Apple</CollectionItem>
      <CollectionItem>🍇 Grape</CollectionItem>
      <CollectionItem>🍊 Orange</CollectionItem>
    </Collection>
  );
}
