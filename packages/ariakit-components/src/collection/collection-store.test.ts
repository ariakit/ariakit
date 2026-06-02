// @vitest-environment jsdom
// "orders rendered items by DOM position" awaits a single nextFrame for the
// store's requestAnimationFrame-batched flush; happy-dom's faster rAF cadence
// doesn't settle it within that window. Pinned to jsdom.
import { init } from "@ariakit/store";
import { afterEach, expect, test } from "vitest";
import { createCollectionStore } from "./collection-store.ts";

function flushBatch() {
  return new Promise<void>((resolve) => queueMicrotask(resolve));
}

function nextFrame() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

afterEach(() => {
  document.body.replaceChildren();
});

test("registers, updates, and unregisters collection items", async () => {
  const store = createCollectionStore<{ id: string; value?: string }>();
  const stop = init(store);

  try {
    const unregister = store.registerItem({ id: "item", value: "one" });
    await flushBatch();

    expect(store.getState().items).toEqual([{ id: "item", value: "one" }]);
    expect(store.item("item")).toEqual({ id: "item", value: "one" });

    const restore = store.registerItem({ id: "item", value: "two" });
    await flushBatch();

    expect(store.getState().items).toEqual([{ id: "item", value: "two" }]);
    expect(store.item("item")).toEqual({ id: "item", value: "two" });

    restore();
    await flushBatch();

    expect(store.getState().items).toEqual([{ id: "item", value: "one" }]);

    unregister();
    await flushBatch();

    expect(store.getState().items).toEqual([]);
    expect(store.item("item")).toBeNull();
  } finally {
    stop();
  }
});

test("orders rendered items by DOM position", async () => {
  const store = createCollectionStore();
  const stop = init(store);
  const first = document.createElement("button");
  const second = document.createElement("button");
  document.body.append(first, second);

  try {
    const unrenderSecond = store.renderItem({
      id: "second",
      element: second,
    });
    const unrenderFirst = store.renderItem({ id: "first", element: first });
    await nextFrame();

    expect(store.getState().renderedItems.map((item) => item.id)).toEqual([
      "first",
      "second",
    ]);

    unrenderFirst();
    unrenderSecond();
    await nextFrame();

    expect(store.getState().renderedItems).toEqual([]);
  } finally {
    stop();
  }
});
