import {
  Collection,
  CollectionItem,
  CollectionViewport,
  useCollectionState,
} from "ariakit/collection";
import "./style.css";

const items = Array.from({ length: 5000 }, (_, i) => ({
  id: `item-${i}`,
  children: `item-${i}`,
  index: i,
}));

export default function Example() {
  const collection = useCollectionState({
    defaultItems: items,
  });
  return (
    <Collection
      state={collection}
      style={{ position: "relative", overflow: "auto", height: 200 }}
      className="collection"
    >
      <div>Items count: {collection.items.length}</div>
      <div>Items count: {collection.items.length}</div>
      <div>Items count: {collection.items.length}</div>
      <div>Items count: {collection.items.length}</div>
      <CollectionViewport items={collection.items}>
        {(item) => <CollectionItem {...item} className="collection-item" />}
      </CollectionViewport>
    </Collection>
  );
}
