import { useCompositeStore } from "@ariakit/react";
import { CompositeRenderer } from "@ariakit/react-components/composite/composite-renderer";
import type { CompositeRendererItem } from "@ariakit/react-components/composite/composite-renderer";
import { useEffect, useState } from "react";
import "./style.css";

// Reproduces https://github.com/ariakit/ariakit/issues/6215
//
// A virtualized renderer without `itemSize` measures each rendered item with an
// internal ResizeObserver. As the list scrolls, items leave the rendered window
// and detach from the DOM; they must be unobserved, and the observer must be
// disconnected when the list unmounts, so no detached node is retained.
//
// Like the issue's StackBlitz repro, we wrap the global ResizeObserver — calling
// through to the real one so measurement still happens — to make the otherwise
// invisible leak observable: the count below is the number of item nodes still
// observed after they have detached from the document.

const observedItems = new Set<Element>();

if (typeof ResizeObserver === "function") {
  const NativeResizeObserver = ResizeObserver;
  class TrackingResizeObserver extends NativeResizeObserver {
    private items = new Set<Element>();
    override observe(target: Element, options?: ResizeObserverOptions) {
      if (target.classList.contains("item")) {
        this.items.add(target);
        observedItems.add(target);
      }
      super.observe(target, options);
    }
    override unobserve(target: Element) {
      this.items.delete(target);
      observedItems.delete(target);
      super.unobserve(target);
    }
    override disconnect() {
      for (const target of this.items) {
        observedItems.delete(target);
      }
      this.items.clear();
      super.disconnect();
    }
  }
  globalThis.ResizeObserver = TrackingResizeObserver;
}

function countDetachedObservedItems() {
  let count = 0;
  for (const element of observedItems) {
    if (element.isConnected) continue;
    count += 1;
  }
  return count;
}

const items = Array.from({ length: 200 }, (_, index) => ({
  id: `item-${index}`,
})) satisfies readonly CompositeRendererItem[];

export default function Example() {
  const store = useCompositeStore();
  const [mounted, setMounted] = useState(true);
  const [nonce, setNonce] = useState(0);
  const [detached, setDetached] = useState(0);

  // Surface the leak live as the user scrolls. React bails out of re-rendering
  // when the count is unchanged, so this only re-renders when it actually moves.
  useEffect(() => {
    let canceled = false;
    const tick = () => {
      if (canceled) return;
      setDetached(countDetachedObservedItems());
      requestAnimationFrame(tick);
    };
    const raf = requestAnimationFrame(tick);
    return () => {
      canceled = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="wrapper">
      <p>
        Detached observed item nodes: <output>{detached}</output>
      </p>
      <button type="button" onClick={() => setNonce((value) => value + 1)}>
        Refresh items
      </button>
      <button type="button" onClick={() => setMounted(false)}>
        Unmount the list
      </button>
      {mounted && (
        <div className="scroller">
          <CompositeRenderer id="composite" store={store} items={items}>
            {(item) => (
              <button
                // Bumping the key remounts the item to a new node while keeping
                // the same id, mirroring a data refresh that recreates rows. The
                // previous node must stop being observed.
                key={`${item.id}-${nonce}`}
                id={item.id}
                className="item"
                ref={item.ref}
                style={item.style}
                type="button"
              >
                item {item.index}
              </button>
            )}
          </CompositeRenderer>
        </div>
      )}
    </div>
  );
}
