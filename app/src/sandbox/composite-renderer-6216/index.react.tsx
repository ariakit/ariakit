import { useCompositeStore } from "@ariakit/react";
import { CompositeRenderer } from "@ariakit/react-components/composite/composite-renderer";
import type { CompositeRendererItem } from "@ariakit/react-components/composite/composite-renderer";

const ROW_HEIGHT = 40;
const COLUMN_WIDTH = 140;

// A horizontal group nested inside a vertical, variable-size renderer. The
// group's columns are described through the `items` metadata so the parent can
// size and position the group. Because the columns lay out along the cross
// (horizontal) axis, the group's *height* should be ~one row tall — never the
// sum of the columns' widths (COLUMN_WIDTH * 5 = 700px).
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
