import {
  Collection,
  CollectionItem,
  CollectionViewport,
  useCollectionState,
} from "ariakit/collection";
import "./style.css";

function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const items = Array.from({ length: 20000 }, (_, i) => ({
  id: `item-${i}`,
  children: `item-${i}`,
  lol: randomIntFromInterval(20, 100),
  // lol: 40,
}));

export default function Example() {
  const collection = useCollectionState({
    defaultItems: items,
  });
  return (
    <Collection
      state={collection}
      style={{ position: "relative", overflow: "auto", height: 200 }}
      // style={{ overflow: "clip", height: 200 }}
      className="collection"
    >
      <div>Items count: {collection.items.length}</div>
      <div>Items count: {collection.items.length}</div>
      <div>Items count: {collection.items.length}</div>
      <div>Items count: {collection.items.length}</div>
      <CollectionViewport>
        {({ lol, ...item }) => (
          <CollectionItem
            {...item}
            style={{ ...item.style, height: lol }}
            className="collection-item"
          />
        )}
      </CollectionViewport>
    </Collection>
  );
}
