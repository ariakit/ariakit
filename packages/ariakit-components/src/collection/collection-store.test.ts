import { createStore, init, sync } from "@ariakit/store";
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

    expect(store.getState().items).toEqual([{ id: "item", value: "one" }]);
    expect(store.item("item")).toBeNull();

    await expect.poll(() => store.getState().items).toEqual([]);
  } finally {
    stop();
  }
});

test("restores layered registrations in a large collection", async () => {
  const items = Array.from({ length: 65 }, (_, index) => ({
    id: `item-${index + 1}`,
    value: "original",
  }));
  const store = createCollectionStore({ defaultItems: items });
  const stop = init(store);
  const initialItems = store.getState().items;

  try {
    const restoreOne = store.registerItem({
      id: "item-33",
      value: "one",
    });
    const restoreTwo = store.registerItem({
      id: "item-33",
      value: "two",
    });

    await expect.poll(() => store.getState().items[32]?.value).toBe("two");
    expect(initialItems[32]?.value).toBe("original");
    const itemsWithTwo = store.getState().items;

    restoreTwo();

    await expect.poll(() => store.getState().items[32]?.value).toBe("one");
    expect(itemsWithTwo[32]?.value).toBe("two");

    restoreOne();

    await expect.poll(() => store.getState().items[32]?.value).toBe("original");
  } finally {
    stop();
  }
});

test("rebuilds a large cache after crossing its threshold", async () => {
  const store = createCollectionStore<{
    id: string;
    value?: string;
  }>();
  const stop = init(store);
  const cleanups = Array.from({ length: 64 }, (_, index) =>
    store.registerItem({ id: `item-${index + 1}` }),
  );

  try {
    await expect.poll(() => store.getState().items).toHaveLength(64);

    cleanups.pop()?.();
    await expect.poll(() => store.getState().items).toHaveLength(63);

    const remove = store.registerItem({
      id: "item-64",
      value: "restored",
    });
    const restore = store.registerItem({
      id: "item-64",
      value: "layered",
    });

    await expect
      .poll(() => store.getState().items.at(-1)?.value)
      .toBe("layered");
    expect(
      store.getState().items.filter((item) => item.id === "item-64"),
    ).toHaveLength(1);

    restore();
    await expect
      .poll(() => store.getState().items.at(-1)?.value)
      .toBe("restored");

    remove();
    await expect.poll(() => store.getState().items).toHaveLength(63);

    for (const cleanup of cleanups) {
      cleanup();
    }
    await expect.poll(() => store.getState().items).toEqual([]);
  } finally {
    stop();
  }
});

test("invalidates a large cache when a synchronized store changes", async () => {
  const items = Array.from({ length: 65 }, (_, index) => ({
    id: `item-${index + 1}`,
    value: "original",
  }));
  const parent = createCollectionStore({ defaultItems: items });
  const store = createCollectionStore({ store: parent });
  const stopParent = init(parent);
  const stop = init(store);

  try {
    const unregister = store.registerItem({
      id: "child-item",
      value: "child",
    });
    await expect.poll(() => store.getState().items).toHaveLength(66);

    const restoreParent = parent.registerItem({
      id: "parent-item",
      value: "parent",
    });
    await expect
      .poll(
        () =>
          store.getState().items.find((item) => item.id === "parent-item")
            ?.value,
      )
      .toBe("parent");

    const restoreChild = store.registerItem({
      id: "parent-item",
      value: "child",
    });
    await expect
      .poll(
        () =>
          store.getState().items.find((item) => item.id === "parent-item")
            ?.value,
      )
      .toBe("child");
    expect(
      store.getState().items.filter((item) => item.id === "parent-item"),
    ).toHaveLength(1);

    restoreChild();
    await expect
      .poll(
        () =>
          store.getState().items.find((item) => item.id === "parent-item")
            ?.value,
      )
      .toBe("parent");

    restoreParent();
    await expect
      .poll(() =>
        store.getState().items.some((item) => item.id === "parent-item"),
      )
      .toBe(false);

    unregister();
    await expect.poll(() => store.getState().items).toHaveLength(65);
  } finally {
    stop();
    stopParent();
  }
});

test("resolves controlled items added after initialization", () => {
  const store = createCollectionStore<{ id: string; value?: string }>();
  const stop = init(store);

  try {
    const apple = { id: "apple", value: "Apple" };
    store.setState("items", [apple]);

    expect(store.item("apple")).toBe(apple);

    store.setState("items", []);

    expect(store.item("apple")).toBeNull();
  } finally {
    stop();
  }
});

test("synchronizes controlled item lookups while stopped", () => {
  const store = createCollectionStore<{ id: string; value?: string }>();
  const stop = init(store);
  const apple = { id: "apple", value: "Apple" };

  store.setState("items", [apple]);
  expect(store.item("apple")).toBe(apple);

  stop();
  store.setState("items", []);

  const stopAgain = init(store);
  try {
    expect(store.getState().items).toEqual([]);
    expect(store.item("apple")).toBeNull();
  } finally {
    stopAgain();
  }
});

test("updates controlled item lookups before external sync listeners", () => {
  const store = createCollectionStore<{ id: string; value?: string }>();
  const observedItems: Array<{ id: string; value?: string } | null> = [];
  const stopSync = sync(store, ["items"], (state) => {
    const id = state.items[0]?.id;
    if (!id) return;
    observedItems.push(store.item(id));
  });
  const stop = init(store);

  try {
    const apple = { id: "apple", value: "Apple" };
    store.setState("items", [apple]);

    expect(observedItems).toEqual([apple]);
  } finally {
    stop();
    stopSync();
  }
});

test("restores a controlled twin after its item unregisters", async () => {
  const store = createCollectionStore<{ id: string; value?: string }>();
  const stop = init(store);

  try {
    const unregister = store.registerItem({ id: "apple", value: "mounted" });
    await expect.poll(() => store.getState().items).toHaveLength(1);

    const controlledApple = { id: "apple", value: "controlled" };
    store.setState("items", [controlledApple]);

    expect(store.item("apple")?.value).toBe("mounted");

    unregister();

    expect(store.item("apple")).toBe(controlledApple);
  } finally {
    stop();
  }
});

test("preserves controlled items across registration flushes", async () => {
  const store = createCollectionStore<{ id: string; value?: string }>();
  const stop = init(store);

  try {
    const apple = { id: "apple", value: "Apple" };
    store.setState("items", [apple]);

    const unregister = store.registerItem({ id: "banana", value: "Banana" });
    await expect.poll(() => store.getState().items[0]?.id).toBe("banana");

    expect(store.item("apple")).toBe(apple);

    unregister();
    await expect.poll(() => store.getState().items).toEqual([]);

    expect(store.item("apple")).toBe(apple);
  } finally {
    stop();
  }
});

test("treats reused registration snapshots as controlled updates", async () => {
  const store = createCollectionStore<{ id: string; value?: string }>();
  const stop = init(store);

  try {
    const unregister = store.registerItem({
      id: "banana",
      value: "Banana",
    });
    await expect.poll(() => store.getState().items).toHaveLength(1);
    const registeredItems = store.getState().items;

    const orange = { id: "orange", value: "Orange" };
    store.setState("items", [orange]);
    store.setState("items", registeredItems);

    expect(store.item("orange")).toBeNull();

    unregister();

    expect(store.item("banana")).toBe(registeredItems[0]);
  } finally {
    stop();
  }
});

test("treats registration snapshots reused by stale stores as controlled", async () => {
  const apple = { id: "apple", value: "Apple" };
  const parent = createCollectionStore({ defaultItems: [apple] });
  const staleStore = createCollectionStore({ store: parent });
  const stop = init(parent);

  try {
    const banana = { id: "banana", value: "Banana" };
    const unregister = parent.registerItem(banana);
    await expect.poll(() => parent.getState().items).toContain(banana);
    const registeredItems = parent.getState().items;

    staleStore.setState("items", registeredItems);
    unregister();

    expect(staleStore.getState().items).toContain(banana);
    expect(staleStore.item("banana")).toBe(banana);
  } finally {
    stop();
  }
});

test("updates item lookups before parent store listeners", () => {
  const parent = createStore({
    items: [] as Array<{ id: string }>,
    renderedItems: [] as Array<{ id: string }>,
  });
  let store!: ReturnType<typeof createCollectionStore>;
  let observedIds: [string | undefined, string | undefined] | undefined;
  const stopSync = sync(parent, ["items"], ({ items }) => {
    const id = items[0]?.id;
    if (!id) return;
    observedIds = [store.getState().items[0]?.id, store.item(id)?.id];
  });
  store = createCollectionStore({ store: parent });

  try {
    store.setState("items", (items) => [...items, { id: "apple" }]);

    expect(observedIds).toEqual(["apple", "apple"]);
  } finally {
    stopSync();
  }
});

test("synchronizes controlled item lookups across composed stores", async () => {
  const parent = createCollectionStore<{ id: string; value?: string }>();
  const store = createCollectionStore({ store: parent });
  const stopParent = init(parent);
  const stop = init(store);

  try {
    const apple = { id: "apple", value: "Apple" };
    store.setState("items", [apple]);

    expect(parent.item("apple")).toBe(apple);
    expect(store.item("apple")).toBe(apple);

    const orange = { id: "orange", value: "Orange" };
    parent.setState("items", [orange]);

    expect(parent.item("apple")).toBeNull();
    expect(store.item("apple")).toBeNull();
    expect(parent.item("orange")).toBe(orange);
    expect(store.item("orange")).toBe(orange);

    const unregister = store.registerItem({ id: "banana", value: "Banana" });
    await expect.poll(() => parent.item("banana")?.value).toBe("Banana");

    const nestedStore = createCollectionStore({ store });
    const stopNested = init(nestedStore);

    try {
      expect(nestedStore.item("banana")?.value).toBe("Banana");

      unregister();

      expect(parent.item("banana")).toBeNull();
      expect(store.item("banana")).toBeNull();
      expect(nestedStore.item("banana")).toBeNull();
    } finally {
      stopNested();
    }
  } finally {
    stop();
    stopParent();
  }
});

test("indexes controlled items once across composed stores", () => {
  const parent = createCollectionStore();
  const stores = Array.from({ length: 10 }, () =>
    createCollectionStore({ store: parent }),
  );
  const stops = [init(parent), ...stores.map(init)];
  let idReads = 0;
  const items = Array.from({ length: 100 }, (_, index) => ({
    get id() {
      idReads += 1;
      return `item-${index + 1}`;
    },
  }));

  try {
    parent.setState("items", items);

    expect(idReads).toBe(items.length);
  } finally {
    for (const stop of stops) {
      stop();
    }
  }
});

test("preserves controlled lookups when composing from a stale store", () => {
  const apple = { id: "apple", value: "Apple" };
  const parent = createCollectionStore({ defaultItems: [apple] });
  const staleStore = createCollectionStore({ store: parent });
  const stopParent = init(parent);

  try {
    const orange = { id: "orange", value: "Orange" };
    parent.setState("items", [orange]);

    const store = createCollectionStore({ store: staleStore });

    expect(parent.item("apple")).toBeNull();
    expect(store.item("apple")).toBeNull();
    expect(parent.item("orange")).toBe(orange);
    expect(store.item("orange")).toBe(orange);
  } finally {
    stopParent();
  }
});

test("restores composed registrations before child initialization", () => {
  const parent = createCollectionStore<{ id: string; value?: string }>();
  const store = createCollectionStore({ store: parent });
  const unregisterParent = parent.registerItem({
    id: "item",
    value: "parent",
  });
  const unregisterChild = store.registerItem({
    id: "item",
    value: "child",
  });

  expect(parent.item("item")?.value).toBe("child");
  expect(store.item("item")?.value).toBe("child");

  unregisterChild();

  expect(parent.item("item")?.value).toBe("parent");
  expect(store.item("item")?.value).toBe("parent");

  unregisterParent();

  expect(parent.item("item")).toBeNull();
  expect(store.item("item")).toBeNull();
});

test("preserves controlled items when a composed store initializes late", async () => {
  const apple = { id: "apple", value: "Apple" };
  const parent = createCollectionStore({ defaultItems: [apple] });
  const store = createCollectionStore({ store: parent });
  const stopParent = init(parent);

  try {
    const orange = { id: "orange", value: "Orange" };
    parent.setState("items", [orange]);

    const unregister = parent.registerItem({
      id: "banana",
      value: "Banana",
    });
    await expect.poll(() => parent.getState().items).toHaveLength(2);

    const stop = init(store);

    try {
      unregister();

      expect(parent.item("banana")).toBeNull();
      expect(store.item("banana")).toBeNull();
      expect(parent.item("orange")).toBe(orange);
      expect(store.item("orange")).toBe(orange);
      expect(parent.item("apple")).toBeNull();
      expect(store.item("apple")).toBeNull();

      await expect.poll(() => store.getState().items).toEqual([apple]);
    } finally {
      stop();
    }
  } finally {
    stopParent();
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

test("updates rendered items after sorting a large collection", async () => {
  const store = createCollectionStore<{
    id: string;
    element?: HTMLElement | null;
    value?: string;
  }>();
  const stop = init(store);
  const elements = Array.from({ length: 65 }, () =>
    document.createElement("button"),
  );
  document.body.append(...elements);

  try {
    const cleanups = elements
      .map((element, index) => ({ element, id: `item-${index + 1}` }))
      .reverse()
      .map((item) => store.renderItem(item));

    await expect
      .poll(() => store.getState().renderedItems.map((item) => item.id))
      .toEqual(elements.map((_, index) => `item-${index + 1}`));

    const restore = store.renderItem({
      id: "item-33",
      element: elements[32],
      value: "updated",
    });

    await expect
      .poll(() => store.getState().renderedItems[32]?.value)
      .toBe("updated");
    expect(
      store.getState().renderedItems.filter((item) => item.id === "item-33"),
    ).toHaveLength(1);

    restore();
    await expect
      .poll(() => store.getState().renderedItems[32]?.value)
      .toBeUndefined();

    for (const cleanup of cleanups) {
      cleanup();
    }
    await expect.poll(() => store.getState().renderedItems).toEqual([]);
  } finally {
    stop();
  }
});
