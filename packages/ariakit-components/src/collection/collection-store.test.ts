import { init } from "@ariakit/store";
import { afterEach, expect, test } from "vitest";
import { createCollectionStore } from "./collection-store.ts";

afterEach(() => {
  document.body.replaceChildren();
});

test("registers, updates, and unregisters collection items", async () => {
  const store = createCollectionStore<{ id: string; value?: string }>();
  const stop = init(store);

  try {
    const unregister = store.registerItem({ id: "item", value: "one" });

    await expect
      .poll(() => store.getState().items)
      .toEqual([{ id: "item", value: "one" }]);
    expect(store.item("item")).toEqual({ id: "item", value: "one" });

    const restore = store.registerItem({ id: "item", value: "two" });

    await expect
      .poll(() => store.getState().items)
      .toEqual([{ id: "item", value: "two" }]);
    expect(store.item("item")).toEqual({ id: "item", value: "two" });

    restore();

    await expect
      .poll(() => store.getState().items)
      .toEqual([{ id: "item", value: "one" }]);

    unregister();

    await expect.poll(() => store.getState().items).toEqual([]);
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

    await expect
      .poll(() => store.getState().renderedItems.map((item) => item.id))
      .toEqual(["first", "second"]);

    unrenderFirst();
    unrenderSecond();

    await expect.poll(() => store.getState().renderedItems).toEqual([]);
  } finally {
    stop();
  }
});
