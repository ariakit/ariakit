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

const items = Array.from({ length: 10000 }, (_, i) => ({
  id: `item-${i}`,
  children: `item-${i}`,
  lol: randomIntFromInterval(30, 200),
  i,
  // type: i % 30 === 0 ? "presentation" : undefined,
}));

export default function Example() {
  const composite = useCompositeState({ defaultItems: items });

  // useEffect(() => {
  //   const fetchItems = async () => {
  //     const res = await fetch("https://jsonplaceholder.typicode.com/comments");
  //     const result = await res.json();
  //     return result.map((item) => ({
  //       id: `item-${item.id}`,
  //       children: item.body,
  //       "data-group": Math.random() > 0.65 ? "group-1" : "group-2",
  //     }));
  //   };
  //   fetchItems().then(setItems);
  // }, []);

  const [size, setSize] = useState(400);

  console.log(composite.renderedItems);

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
      }}
    >
      <button onClick={() => setSize((size) => size + 400)}>Expand</button>
      {/* <div>Items count: {collection.items.length}</div> */}
      <Composite
        state={composite}
        style={{
          position: "relative",
          width: "100%",
          // flexDirection: "column-reverse",
          overflow: "auto",
          height: 50,
        }}
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
        >
          {({ lol, type, i, ...item }) =>
            type === "presentation" ? (
              <div {...item} style={{ ...item.style, height: lol }}>
                Title
              </div>
            ) : (
              <CompositeItem
                as="div"
                {...item}
                style={{ ...item.style, height: lol }}
                className={`collection-item ${i % 2 === 0 ? "even" : "odd"}`}
              >
                <div className="collection-item-child">{item.children}</div>
              </CompositeItem>
            )
          }
        </CollectionViewport>
      </Composite>
    </div>
  );
}
