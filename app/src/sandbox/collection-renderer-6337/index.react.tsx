import { CollectionRenderer } from "@ariakit/react-components/collection/collection-renderer";

const GAP = 10;
const PADDING = 20;
const ITEM_HEIGHT = 32;

const measuredItems = Array.from({ length: 8 }, (_, index) => ({
  id: `measured-item-${index + 1}`,
}));

const fixedItems = Array.from({ length: 8 }, (_, index) => ({
  id: `fixed-item-${index + 1}`,
}));

const wrapperStyle = {
  display: "flex",
  gap: 16,
} as const;

const sectionStyle = {
  display: "grid",
  gap: 8,
} as const;

const scrollerStyle = {
  width: 200,
  height: 200,
  overflowY: "auto",
  border: "1px solid gray",
} as const;

const itemStyle = {
  boxSizing: "border-box",
  display: "block",
  width: "100%",
  height: ITEM_HEIGHT,
  background: "#eee",
} as const;

export default function Example() {
  return (
    <div style={wrapperStyle}>
      <section style={sectionStyle}>
        <h2>Measured</h2>
        <div style={scrollerStyle}>
          <CollectionRenderer
            id="measured-renderer"
            items={measuredItems}
            initialItems={measuredItems.length}
            gap={GAP}
            padding={PADDING}
          >
            {(item) => (
              <button
                key={item.id}
                id={item.id}
                ref={item.ref}
                style={{ ...itemStyle, ...item.style }}
                type="button"
              >
                Measured {item.index + 1}
              </button>
            )}
          </CollectionRenderer>
        </div>
      </section>
      <section style={sectionStyle}>
        <h2>Fixed</h2>
        <div style={scrollerStyle}>
          <CollectionRenderer
            id="fixed-renderer"
            items={fixedItems}
            initialItems={fixedItems.length}
            itemSize={ITEM_HEIGHT}
            gap={GAP}
            padding={PADDING}
          >
            {(item) => (
              <button
                key={item.id}
                id={item.id}
                ref={item.ref}
                style={{ ...itemStyle, ...item.style }}
                type="button"
              >
                Fixed {item.index + 1}
              </button>
            )}
          </CollectionRenderer>
        </div>
      </section>
    </div>
  );
}
