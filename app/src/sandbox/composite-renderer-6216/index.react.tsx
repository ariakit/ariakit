import { useCompositeStore } from "@ariakit/react";
import { CompositeRenderer } from "@ariakit/react-components/composite/composite-renderer";
import type { CompositeRendererItem } from "@ariakit/react-components/composite/composite-renderer";

const ROW_HEIGHT = 40;
const COLUMN_WIDTH = 140;

// `columns` models a horizontal group: five columns laid out along the x-axis
// (COLUMN_WIDTH * 5 = 700px wide). Nested inside the vertical list, the group's
// height should be ~one row tall — never the sum of the columns' widths.
const columns = Array.from({ length: 5 }, (_, index) => ({
  id: `column-${index}`,
  style: { width: COLUMN_WIDTH },
})) satisfies readonly CompositeRendererItem[];

const items = [
  { id: "row-0", style: { height: ROW_HEIGHT } },
  { id: "row-1", style: { height: ROW_HEIGHT } },
  { id: "group", orientation: "horizontal", items: columns },
  { id: "row-3", style: { height: ROW_HEIGHT } },
] satisfies readonly CompositeRendererItem[];

// A horizontal group nested one level deeper, inside a same-orientation wrapper.
// The wrapper measures the group through metadata alone (no rendered element),
// so the group's height comes from the largest column extent (max of 28 and 36)
// rather than the sum of the columns' widths.
const nestedColumns = [
  { id: "nested-column-0", style: { width: COLUMN_WIDTH, height: 28 } },
  { id: "nested-column-1", style: { width: COLUMN_WIDTH, height: 36 } },
] satisfies readonly CompositeRendererItem[];

const nestedItems = [
  { id: "nested-row-0", style: { height: ROW_HEIGHT } },
  {
    id: "nested-group",
    items: [{ orientation: "horizontal", items: nestedColumns }],
  },
  { id: "nested-row-2", style: { height: ROW_HEIGHT } },
] satisfies readonly CompositeRendererItem[];

interface ListProps {
  label: string;
  items: readonly CompositeRendererItem[];
}

function List({ label, items }: ListProps) {
  const store = useCompositeStore();
  return (
    <CompositeRenderer
      store={store}
      items={items}
      initialItems={items.length}
      aria-label={label}
    >
      {(item) => (
        <button
          data-index={item.index}
          id={item.id}
          key={item.id}
          ref={item.ref}
          style={item.style}
          type="button"
        >
          {item.id}
        </button>
      )}
    </CompositeRenderer>
  );
}

export default function Example() {
  return (
    <>
      <List label="Rows" items={items} />
      <List label="Nested rows" items={nestedItems} />
    </>
  );
}
