import { useCompositeStore } from "@ariakit/react";
import { CompositeRenderer } from "@ariakit/react-components/composite/composite-renderer";
import type { CompositeRendererItem } from "@ariakit/react-components/composite/composite-renderer";
import { useState } from "react";

// Reproduces https://github.com/ariakit/ariakit/issues/6215
//
// A virtualized renderer without `itemSize` measures each rendered item with an
// internal ResizeObserver. Items that leave the rendered window — and the whole
// renderer on unmount — must stop being observed so their detached nodes aren't
// retained.

const items = Array.from({ length: 10 }, (_, index) => ({
  id: `item-${index}`,
})) satisfies readonly CompositeRendererItem[];

const allIndices = [0, 1, 2, 3, 4];
const fewerIndices = [0, 1];

export default function Example() {
  const store = useCompositeStore();
  const [mounted, setMounted] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [nonce, setNonce] = useState(0);

  return (
    <div>
      <button type="button" onClick={() => setNonce((value) => value + 1)}>
        Refresh items
      </button>
      <button type="button" onClick={() => setExpanded(false)}>
        Show fewer items
      </button>
      <button type="button" onClick={() => setMounted(false)}>
        Unmount the list
      </button>
      {mounted && (
        <CompositeRenderer
          id="composite"
          store={store}
          items={items}
          // Workaround for https://github.com/ariakit/ariakit/issues/6215:
          // passing a known `itemSize` skips the measuring `ResizeObserver`
          // path, so no item node is ever observed and nothing can leak.
          // TODO: Remove once #6215 is fixed.
          itemSize={32}
          // CompositeRenderer always keeps the first and last items rendered, so
          // shrinking this still leaves the last item mounted; the middle items
          // it drops are what must stop being observed.
          persistentIndices={expanded ? allIndices : fewerIndices}
        >
          {(item) => (
            <button
              // Bumping the key remounts the item to a new node while keeping
              // the same id, mirroring a data refresh that recreates rows.
              key={`${item.id}-${nonce}`}
              id={item.id}
              ref={item.ref}
              style={item.style}
              type="button"
            >
              item {item.index}
            </button>
          )}
        </CompositeRenderer>
      )}
    </div>
  );
}
