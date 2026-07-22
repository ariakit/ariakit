import { CollectionRenderer } from "@ariakit/react-components/collection/collection-renderer";
import type { CollectionRendererItemObject } from "@ariakit/react-components/collection/collection-renderer";
import { useCollectionStore } from "@ariakit/react-components/collection/collection-store";
import { useState } from "react";
import "./style.css";

const groupCount = 200;
const itemsPerGroup = 50;
const itemSize = 20;
const groupSize = itemsPerGroup * itemSize;

interface RendererItem extends CollectionRendererItemObject {
  id: string;
  label: string;
  items?: RendererItem[];
}

const groups = Array.from({ length: groupCount }, (_, groupIndex) => {
  const groupNumber = groupIndex + 1;
  const items = Array.from({ length: itemsPerGroup }, (_, itemIndex) => {
    const itemNumber = groupIndex * itemsPerGroup + itemIndex + 1;
    return { id: `item-${itemNumber}`, label: `Item ${itemNumber}` };
  });
  return {
    id: `group-${groupNumber}`,
    label: `Group ${groupNumber}`,
    items,
  };
}) satisfies readonly RendererItem[];

const storeItems: RendererItem[] = [];

const persistentGroupIndices = Array.from(
  { length: groupCount },
  (_, index) => index,
);

function RendererBenchmark() {
  const store = useCollectionStore({ defaultItems: storeItems });
  const [itemsVisible, setItemsVisible] = useState(true);
  const [updates, setUpdates] = useState(0);

  return (
    <section className="benchmark">
      <div className="controls">
        <button
          className="button"
          type="button"
          onClick={() => setUpdates((value) => value + 1)}
        >
          Rerender nested renderers
        </button>
        <button
          className="button"
          type="button"
          onClick={() => setItemsVisible((visible) => !visible)}
        >
          Toggle renderer items
        </button>
        <output aria-label="Updates">{updates}</output>
        <output aria-label="Items visible">
          {itemsVisible ? "yes" : "no"}
        </output>
      </div>
      <div className="scroller" role="region" aria-label="Renderer viewport">
        <CollectionRenderer
          id="renderer-groups"
          store={store}
          items={itemsVisible ? groups : 0}
          itemSize={groupSize}
          persistentIndices={persistentGroupIndices}
          renderOnResize={false}
          className="renderer"
          role="list"
          aria-label="Renderer items"
        >
          {(group) => (
            <CollectionRenderer
              id={group.id}
              key={group.id}
              store={store}
              items={group.items}
              itemSize={itemSize}
              renderOnResize={false}
              ref={group.ref}
              style={group.style}
              className="group"
              role="group"
              aria-label={group.label}
            >
              {(item) => (
                <div
                  id={item.id}
                  key={item.id}
                  ref={item.ref}
                  style={item.style}
                  className="item"
                  role="listitem"
                  aria-label={item.label}
                  data-update={updates}
                >
                  {item.label}
                </div>
              )}
            </CollectionRenderer>
          )}
        </CollectionRenderer>
      </div>
    </section>
  );
}

export default function Example() {
  const [mounted, setMounted] = useState(false);

  return (
    <main className="root">
      <button className="button" type="button" onClick={() => setMounted(true)}>
        Mount nested renderers
      </button>
      {mounted ? <RendererBenchmark /> : null}
    </main>
  );
}
