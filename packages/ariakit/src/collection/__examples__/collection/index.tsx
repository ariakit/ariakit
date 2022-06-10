import { createRef, useEffect, useMemo, useState } from "react";
import {
  Collection,
  CollectionItem,
  CollectionViewport,
  useCollectionState,
} from "ariakit/collection";
import {
  Composite,
  CompositeItem,
  CompositeTypeahead,
  useCompositeState,
} from "ariakit/composite";
import "./style.css";

function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export default function Example() {
  const [items, setItems] = useState([]);
  const composite = useCompositeState({ items, setItems });

  const [size, setSize] = useState(400);

  useEffect(() => {
    const fetchItems = async () => {
      const res = await fetch("https://jsonplaceholder.typicode.com/comments");
      const result = await res.json();
      return result.map((item) => ({
        id: `item-${item.id}`,
        children: item.body,
        "data-group": Math.random() > 0.65 ? "group-1" : "group-2",
      }));
    };
    fetchItems().then(setItems);
  }, []);

  return (
    <div style={{ display: "flex", width: "100%", flexDirection: "column" }}>
      {/* <button onClick={() => setSize((size) => size + 100)}>Expand</button> */}
      {/* <div>Items count: {collection.items.length}</div> */}
      <Composite
        state={composite}
        style={{ position: "relative", overflow: "auto", height: size }}
        // style={{ overflow: "clip", height: 200 }}
        className="collection"
      >
        <CollectionViewport
          getVisibleItems={({ items, visibleItems }) => {
            return items.filter(
              (item) =>
                visibleItems.some(({ id }) => id === item.id) ||
                item.id === composite.activeId ||
                item.id === composite.next() ||
                item.id === composite.previous()
            );
          }}
          itemSize={100}
        >
          {(item) => (
            <CompositeItem as="div" {...item} className="collection-item">
              <div className="collection-item-child">{item.children}</div>
            </CompositeItem>
          )}
        </CollectionViewport>
      </Composite>
    </div>
  );
}
