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

const items = Array.from({ length: 50000 }, (_, i) => ({
  id: `item-${i}`,
  children: `item-${i}`,
  // lol: randomIntFromInterval(100, 200),
  lol: 150,
}));

const sizes2 = Array.from({ length: 1000 }, () =>
  randomIntFromInterval(40, 200)
);

export default function Example() {
  const collection = useCollectionState({
    defaultItems: items,
  });

  const rows = useMemo(
    () =>
      chunk(collection.items, 500).map((row, i) => ({
        id: `row-${i}`,
        items: row,
        style: { height: sizes2[i] },
        // ref: createRef<HTMLDivElement>(),
      })),
    [collection.items]
  );

  const [size, setSize] = useState(400);
  const [datas, setDatas] = useState<
    Record<
      string,
      Record<string, { sealed: boolean; start: number; end: number }>
    >
  >({});

  const end = useMemo(() => {
    const values = Object.values(datas);
    return Math.max(
      ...values.map((data) => {
        const values = Object.values(data);
        return values[values.length - 1]?.end || 0;
      })
    );
  }, [datas]);

  return (
    <div style={{ display: "flex", width: "100%", flexDirection: "column" }}>
      {/* <button onClick={() => setSize((size) => size + 100)}>Expand</button> */}
      <div>Items count: {collection.items.length}</div>
      <Collection
        state={collection}
        style={{ position: "relative", overflow: "auto", height: size }}
        // style={{ overflow: "clip", height: 200 }}
        className="collection"
      >
        {/* <div>Items count: {collection.items.length}</div> */}
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
        <CollectionViewport items={rows} style={{ width: end }}>
          {(row) => (
            <CollectionViewport
              {...row}
              itemSize={150}
              data={datas[row.id] || {}}
              setData={(data) => {
                setDatas((prevDatas) => ({
                  ...prevDatas,
                  [row.id]: data,
                }));
              }}
              horizontal
            >
              {({ lol, ...item }) => (
                <CollectionItem
                  {...item}
                  style={{
                    ...item.style,
                    height: "100%",
                    width: lol,
                    outline: "1px solid lightgray",
                    padding: 16,
                  }}
                  className="collection-item"
                />
              )}
            </CollectionViewport>
          )}
        </CollectionViewport>
      </Collection>
    </div>
  );
}
