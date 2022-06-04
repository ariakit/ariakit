import { createRef, useMemo, useState } from "react";
import {
  Collection,
  CollectionItem,
  CollectionViewport,
  useCollectionState,
} from "ariakit/collection";
import { chunk } from "lodash";
import "./style.css";

function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const items = Array.from({ length: 5000 }, (_, i) => ({
  id: `item-${i}`,
  children: `item-${i}`,
  lol: randomIntFromInterval(20, 200),
  // lol: 100,
}));

export default function Example() {
  const collection = useCollectionState({
    defaultItems: items,
  });

  const rows = useMemo(
    () =>
      chunk(collection.items, 100).map((row, i) => ({
        id: `row-${i}`,
        items: row,
        // ref: createRef<HTMLDivElement>(),
      })),
    [collection.items]
  );

  const [size, setSize] = useState(200);

  return (
    <Collection
      state={collection}
      style={{ position: "relative", overflow: "auto", height: size }}
      // style={{ overflow: "clip", height: 200 }}
      className="collection"
    >
      <button onClick={() => setSize((size) => size + 100)}>Expand</button>
      <div>Items count: {collection.items.length}</div>
      {/* <CollectionViewport>
        {({ lol, ...item }) => (
          <CollectionItem
            {...item}
            style={{
              ...item.style,
              width: "100%",
              height: lol,
              border: "1px solid red",
            }}
            className="collection-item"
          />
        )}
      </CollectionViewport> */}
      <CollectionViewport items={rows} itemSize={100}>
        {(row) => (
          <CollectionViewport {...row} itemSize={100} horizontal>
            {({ lol, ...item }) => (
              <CollectionItem
                {...item}
                style={{
                  ...item.style,
                  width: lol,
                  border: "1px solid red",
                }}
                className="collection-item"
              />
            )}
          </CollectionViewport>
        )}
      </CollectionViewport>
    </Collection>
  );
}
