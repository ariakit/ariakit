import { useCompositeStore } from "@ariakit/react";
import { CompositeRenderer } from "@ariakit/react-components/composite/composite-renderer";
import type { CompositeRendererItem } from "@ariakit/react-components/composite/composite-renderer";
import "./style.css";

const COLUMN_WIDTH = 140;

// `columns` describes a horizontal group: five columns laid out along the
// x-axis (COLUMN_WIDTH * 5 = 700px wide). Inside the vertical list the group is
// only one row tall (see `style.css`), so its height must come from the
// rendered element — never from the sum of the columns' widths.
const columns = Array.from({ length: 5 }, (_, index) => ({
  id: `column-${index}`,
  style: { width: COLUMN_WIDTH },
})) satisfies readonly CompositeRendererItem[];

const items = [
  { id: "row-0" },
  { id: "row-1" },
  { id: "group", orientation: "horizontal", items: columns },
  { id: "row-3" },
] satisfies readonly CompositeRendererItem[];

// A horizontal group nested one level deeper, inside a same-orientation wrapper.
// The wrapper measures the group through metadata alone, so the group's height
// comes from the largest column extent (max of 28 and 36) rather than the sum
// of the columns' widths.
const nestedColumns = [
  { id: "nested-column-0", style: { width: COLUMN_WIDTH, height: 28 } },
  { id: "nested-column-1", style: { width: COLUMN_WIDTH, height: 36 } },
] satisfies readonly CompositeRendererItem[];

const nestedItems = [
  { id: "nested-row-0" },
  {
    id: "nested-group",
    items: [{ orientation: "horizontal", items: nestedColumns }],
  },
  { id: "nested-row-2" },
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
          className={"items" in item ? "group" : "row"}
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
