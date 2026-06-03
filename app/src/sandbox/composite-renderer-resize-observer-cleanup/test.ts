import { click, q } from "@ariakit/test";
import { afterAll, expect, test } from "vitest";

// A leaked ResizeObserver subscription has no user-facing manifestation, so the
// regression is asserted through the observer bookkeeping itself. This spy
// replaces the browser ResizeObserver and tracks the elements each observer
// instance is watching. It is installed at module load so it is in place before
// the shared setup renders the example, and it never invokes the callback —
// the renderer only relies on observe/unobserve/disconnect here.
const observers = new Set<MockResizeObserver>();
const originalResizeObserver = window.ResizeObserver;

class MockResizeObserver implements ResizeObserver {
  readonly targets = new Set<Element>();
  constructor() {
    observers.add(this);
  }
  observe(target: Element) {
    this.targets.add(target);
  }
  unobserve(target: Element) {
    this.targets.delete(target);
  }
  disconnect() {
    this.targets.clear();
  }
}

window.ResizeObserver = MockResizeObserver;

afterAll(() => {
  window.ResizeObserver = originalResizeObserver;
});

function observedCount() {
  let count = 0;
  for (const observer of observers) {
    count += observer.targets.size;
  }
  return count;
}

test("unobserves replaced item elements and disconnects on unmount", async () => {
  expect(q.text("First item")).toBeVisible();
  expect(observedCount()).toBe(2);

  // Replacing the first item swaps its DOM node. The stale node must be
  // unobserved as the new one is observed, so the count stays at 2 instead of
  // leaking the replaced node.
  await click(q.button.ensure("Replace first item"));
  expect(observedCount()).toBe(2);

  // Unmounting the renderer disconnects the observer so no stale node lingers.
  await click(q.button.ensure("Hide renderer"));
  expect(observedCount()).toBe(0);
});
