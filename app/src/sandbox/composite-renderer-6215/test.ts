import { click, q } from "@ariakit/test";
import { afterAll, afterEach, expect, test } from "vitest";

// Reproduces https://github.com/ariakit/ariakit/issues/6215
//
// The virtualized renderer measures items with an internal ResizeObserver. We
// instrument the global ResizeObserver (mirroring the issue's StackBlitz repro)
// to make the otherwise-invisible leak observable. Item nodes that are no
// longer rendered — re-rendered to a new node, dropped from the rendered set,
// or removed when the whole list unmounts — must stop being observed, and the
// observer must be disconnected when the renderer unmounts. While the renderer
// is measuring, the items that are still rendered must stay observed.
//
// The `itemSize` workaround skips the measuring/ResizeObserver path entirely, so
// nothing is observed and nothing can leak; the assertions below hold then too.

const observers: MockResizeObserver[] = [];

class MockResizeObserver {
  elements = new Set<Element>();
  observedItems = false;
  disconnected = false;
  constructor(_callback: ResizeObserverCallback) {
    observers.push(this);
  }
  observe(element: Element) {
    if (element.id.startsWith("item-")) this.observedItems = true;
    // Observing again means the observer is live, so it isn't disconnected.
    // Without this reset, a stale `disconnected` from an earlier disconnect (or
    // StrictMode's simulated cleanup) would let the unmount assertion pass even
    // if the observer is only unobserved, never disconnected, on unmount.
    this.disconnected = false;
    this.elements.add(element);
  }
  unobserve(element: Element) {
    this.elements.delete(element);
  }
  disconnect() {
    this.disconnected = true;
    this.elements.clear();
  }
}

const NativeResizeObserver = globalThis.ResizeObserver;
globalThis.ResizeObserver =
  MockResizeObserver as unknown as typeof ResizeObserver;

// The mock instances accumulate across happy-dom's configured retry, so clear
// them after each attempt to keep every run measuring a single mount lifecycle.
afterEach(() => {
  observers.length = 0;
});

afterAll(() => {
  globalThis.ResizeObserver = NativeResizeObserver;
});

// Ids of the item nodes that are still attached to the document and observed.
function observedItemIds() {
  const ids = new Set<string>();
  for (const observer of observers) {
    for (const element of observer.elements) {
      if (!element.isConnected) continue;
      if (!element.id.startsWith("item-")) continue;
      ids.add(element.id);
    }
  }
  return ids;
}

// Count of observed item nodes that are no longer attached — the leak in #6215.
function detachedObservedItemCount() {
  let count = 0;
  for (const observer of observers) {
    for (const element of observer.elements) {
      if (element.isConnected) continue;
      if (!element.id.startsWith("item-")) continue;
      count += 1;
    }
  }
  return count;
}

// Ids of the item nodes currently rendered in the document.
function renderedItemIds() {
  const ids = new Set<string>();
  for (const button of q.button.all()) {
    if (button.id.startsWith("item-")) ids.add(button.id);
  }
  return ids;
}

// Whether the renderer is measuring items with the ResizeObserver. The
// `itemSize` workaround skips this path, leaving no item ever observed.
function isMeasuring() {
  return observers.some((observer) => observer.observedItems);
}

// No detached item node may stay observed; and while measuring, every rendered
// item must stay observed so an over-aggressive cleanup can't silently stop
// measuring the items that are still on screen.
function expectNoLeakedItems() {
  expect(detachedObservedItemCount()).toBe(0);
  if (isMeasuring()) {
    expect(observedItemIds()).toEqual(renderedItemIds());
  }
}

test("does not retain detached item nodes that are no longer rendered", async () => {
  expectNoLeakedItems();

  // Re-rendering items to new nodes (same id) must unobserve the old nodes
  // while keeping the new ones observed.
  await click(q.button("Refresh items"));
  expectNoLeakedItems();

  // Dropping items from the rendered set (here by shrinking `persistentIndices`,
  // the same node-detach path a scroll takes) must unobserve the removed items
  // while leaving the still-rendered items observed.
  await click(q.button("Show fewer items"));
  expectNoLeakedItems();

  // Unmounting the whole list must disconnect the observer — not merely
  // unobserve each item — so the observer and its callbacks aren't retained.
  await click(q.button("Unmount the list"));
  expect(detachedObservedItemCount()).toBe(0);
  expect(observedItemIds().size).toBe(0);
  const itemObservers = observers.filter((observer) => observer.observedItems);
  expect(itemObservers.every((observer) => observer.disconnected)).toBe(true);
});
