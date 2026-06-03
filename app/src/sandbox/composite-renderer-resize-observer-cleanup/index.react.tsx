import { CompositeRenderer } from "@ariakit/react-components/composite/composite-renderer";
import type { CompositeRendererItemObject } from "@ariakit/react-components/composite/composite-renderer";
import { StrictMode, useEffect, useState, useSyncExternalStore } from "react";

interface ResizeObserverStore {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => number;
  restore: () => void;
}

function createResizeObserverStore(): ResizeObserverStore {
  const originalResizeObserver = window.ResizeObserver;
  const observers = new Set<TrackingResizeObserver>();
  const listeners = new Set<() => void>();

  const emit = () => {
    for (const listener of listeners) {
      listener();
    }
  };

  class TrackingResizeObserver implements ResizeObserver {
    private readonly elements = new Set<Element>();
    private readonly observer: ResizeObserver;

    constructor(callback: ResizeObserverCallback) {
      this.observer = new originalResizeObserver(callback);
      observers.add(this);
    }

    get observedCount() {
      return this.elements.size;
    }

    observe(target: Element) {
      this.observer.observe(target);
      observers.add(this);
      this.elements.add(target);
      emit();
    }

    unobserve(target: Element) {
      this.observer.unobserve(target);
      this.elements.delete(target);
      emit();
    }

    disconnect() {
      this.observer.disconnect();
      this.elements.clear();
      observers.delete(this);
      emit();
    }
  }

  window.ResizeObserver = TrackingResizeObserver;

  const getSnapshot = () => {
    let count = 0;
    for (const observer of observers) {
      count += observer.observedCount;
    }
    return count;
  };

  return {
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot,
    restore: () => {
      window.ResizeObserver = originalResizeObserver;
      for (const observer of observers) {
        observer.disconnect();
      }
      observers.clear();
      emit();
    },
  };
}

const getZero = () => 0;

interface ObservedItem extends CompositeRendererItemObject {
  label: string;
}

const items = [
  { id: "observed-first", label: "First item" },
  { id: "observed-second", label: "Second item" },
] satisfies ObservedItem[];

function Fixture({ store }: { store: ResizeObserverStore }) {
  const observedCount = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    getZero,
  );
  const [mounted, setMounted] = useState(true);
  const [version, setVersion] = useState(0);

  return (
    <>
      <button type="button" onClick={() => setVersion((value) => value + 1)}>
        Replace first item
      </button>
      <button type="button" onClick={() => setMounted(false)}>
        Hide renderer
      </button>
      <p>Observed items: {observedCount}</p>
      {mounted && (
        <CompositeRenderer
          id="observed-renderer"
          initialItems={items.length}
          items={items}
          renderOnResize={false}
          renderOnScroll={false}
        >
          {(item) => {
            const first = item.id === "observed-first";
            const key = first ? `${item.id}-${version}` : item.id;
            const itemVersion = first ? version : 0;
            return (
              <div
                id={item.id}
                key={key}
                ref={item.ref}
                style={{
                  ...item.style,
                  boxSizing: "border-box",
                  height: 24,
                  padding: 4,
                }}
              >
                {item.label} version {itemVersion}
              </div>
            );
          }}
        </CompositeRenderer>
      )}
    </>
  );
}

export default function Example() {
  const [store, setStore] = useState<ResizeObserverStore | null>(null);

  useEffect(() => {
    const store = createResizeObserverStore();
    setStore(store);
    return () => store.restore();
  }, []);

  if (!store) {
    return <p>Observed items: 0</p>;
  }

  return (
    <StrictMode>
      <Fixture store={store} />
    </StrictMode>
  );
}
