import { CollectionRenderer } from "@ariakit/react-components/collection/collection-renderer";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import "./style.css";

// Size belongs to the rendered element, not item.style. Numeric sizes in the
// item data would let the renderer skip the DOM measurement under test.
function getItems(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: `measured-item-${index + 1}`,
    label: `Item ${index + 1}`,
    height: index % 2 ? 72.3 : 24.4,
  }));
}

interface ViewportProps {
  children: ReactNode;
}

function Viewport({ children }: ViewportProps) {
  const [largeViewport, setLargeViewport] = useState(false);
  const [largeItems, setLargeItems] = useState(false);

  // Children keep their identity when these controls change. Resizing must
  // exercise the renderer's observers without a fixture-owned list rerender.
  return (
    <>
      <label>
        <input
          type="checkbox"
          checked={largeViewport}
          onChange={(event) => setLargeViewport(event.target.checked)}
        />
        Larger viewport
      </label>
      <label>
        <input
          type="checkbox"
          checked={largeItems}
          onChange={(event) => setLargeItems(event.target.checked)}
        />
        Taller items
      </label>
      <div
        role="region"
        aria-label="Measured viewport"
        tabIndex={0}
        className="measured-viewport"
        data-large-viewport={largeViewport || undefined}
        data-large-items={largeItems || undefined}
      >
        {children}
      </div>
    </>
  );
}

export default function Example() {
  const [count, setCount] = useState(1000);
  const [mounted, setMounted] = useState(false);
  const items = useMemo(() => getItems(count), [count]);

  return (
    <main className="measured-benchmark">
      <h1>Measured collection renderer</h1>
      <label>
        Item count
        <select
          value={count}
          disabled={mounted}
          onChange={(event) => setCount(Number(event.target.value))}
        >
          <option value={1000}>1,000</option>
          <option value={10000}>10,000</option>
        </select>
      </label>
      <button type="button" disabled={mounted} onClick={() => setMounted(true)}>
        Mount collection
      </button>
      {mounted && (
        <Viewport>
          <CollectionRenderer
            id="measured-items"
            items={items}
            role="list"
            aria-label="Measured items"
            overscan={1}
          >
            {({ label, height, ...item }) => (
              <div
                key={item.id}
                {...item}
                role="listitem"
                aria-label={label}
                className="measured-item"
                style={{
                  ...item.style,
                  height: `calc(${height}px + var(--extra-height))`,
                }}
              >
                {label}
              </div>
            )}
          </CollectionRenderer>
        </Viewport>
      )}
    </main>
  );
}
