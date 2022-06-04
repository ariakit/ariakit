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

const items = Array.from({ length: 10000 }, (_, i) => ({
  id: `item-${i}`,
  children: `item-${i}`,
  lol: randomIntFromInterval(20, 200),
  // lol: 100,
}));

export default function Example() {
  const collection = useCollectionState({
    defaultItems: items,
  });

  const rows = chunk(collection.items, 100).map((row, i) => ({
    id: `row-${i}`,
    items: row,
  }));

  return (
    <Collection
      state={collection}
      style={{ position: "relative", overflow: "auto", height: 200 }}
      // style={{ overflow: "clip", height: 200 }}
      className="collection"
    >
      <div>Items count: {collection.items.length}</div>
      <CollectionViewport>
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
      </CollectionViewport>
      {/* <CollectionViewport items={rows} itemSize={100}>
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
      </CollectionViewport> */}
    </Collection>
  );
}
