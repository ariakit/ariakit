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
import { chunk } from "lodash";
import "./style.css";

function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const items = Array.from({ length: 20000 }, (_, i) => ({
  id: `item-${i}`,
  children: `item-${i}`,
  lol: randomIntFromInterval(50, 200),
  // lol: 150,
}));

const rows = chunk(items, 142).map((row, i) => ({
  id: `row-${i}`,
  items: row,
  style: { height: 100 },
  // ref: createRef<HTMLDivElement>(),
}));

// const sizes2 = Array.from({ length: 10000 }, () =>
//   randomIntFromInterval(40, 200)
// );

export default function Example() {
  // const collection = useCollectionState({
  //   defaultItems: items,
  // });
  const composite = useCompositeState({ defaultItems: items });

  // useEffect(() => {
  //   console.log(
  //     composite.activeId,
  //     composite.renderedItems.map((item) => item.id)
  //   );
  // }, [composite.activeId, composite.renderedItems]);

  // const rows = useMemo(
  //   () =>
  //     chunk(items, 5000).map((row, i) => ({
  //       id: `row-${i}`,
  //       items: row,
  //       style: { height: 100 },
  //       // ref: createRef<HTMLDivElement>(),
  //     })),
  //   [items]
  // );

  const [size, setSize] = useState(400);
  // const [datas, setDatas] = useState<
  //   Record<
  //     string,
  //     Record<string, { sealed: boolean; start: number; end: number }>
  //   >
  // >({});

  // const end = useMemo(() => {
  //   const values = Object.values(datas);
  //   return Math.max(
  //     ...values.map((data) => {
  //       const values = Object.values(data);
  //       return values[values.length - 1]?.end || 0;
  //     })
  //   );
  // }, [datas]);

  // console.log(collection.renderedItems);

  return (
    <div style={{ display: "flex", width: "100%", flexDirection: "column" }}>
      {/* <button onClick={() => setSize((size) => size + 100)}>Expand</button> */}
      {/* <div>Items count: {collection.items.length}</div> */}
      <Composite
        state={composite}
        as={CompositeTypeahead}
        style={{ position: "relative", overflow: "scroll", height: size }}
        // style={{ overflow: "clip", height: 200 }}
        className="collection"
      >
        {/* <div>Items count: {collection.items.length}</div> */}
        <CollectionViewport itemSize={20}>
          {({ lol, ...item }) => (
            <CompositeItem
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
        {/* <CollectionViewport items={rows}>
          {(row) => (
            <CollectionViewport
              {...row}
              itemSize={150}
              // data={datas[row.id] || {}}
              // setData={(data) => {
              //   setDatas((prevDatas) => ({
              //     ...prevDatas,
              //     [row.id]: data,
              //   }));
              // }}
              horizontal
            >
              {({ lol, ...item }) => (
                <div
                  {...item}
                  style={{
                    ...item.style,
                    height: "100%",
                    width: 150,
                    outline: "1px solid lightgray",
                    padding: 16,
                  }}
                  className="collection-item"
                />
              )}
            </CollectionViewport>
          )}
        </CollectionViewport> */}
      </Composite>
    </div>
  );
}
