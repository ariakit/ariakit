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
  // Workaround for https://github.com/ariakit/ariakit/issues/6216: omit the
  // cross-axis `orientation` from the group's parent-facing metadata so the
  // vertical parent measures the group's height from its rendered element
  // instead of summing the columns' widths. A real app keeps the horizontal
  // layout by setting `orientation` on the group's own nested renderer rather
  // than on this parent item.
  // TODO: Remove once the library fix lands.
  { id: "group", items: columns },
  { id: "row-3", style: { height: ROW_HEIGHT } },
] satisfies readonly CompositeRendererItem[];

export default function Example() {
  const store = useCompositeStore();
  return (
    <CompositeRenderer
      store={store}
      items={items}
      initialItems={items.length}
      aria-label="Rows"
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
