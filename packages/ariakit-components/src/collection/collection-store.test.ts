import { createStore, init, omit, pick, sync } from "@ariakit/store";
import { afterEach, expect, test } from "vitest";
import { createCompositeStore } from "../composite/composite-store.ts";
import { createCollectionStore } from "./collection-store.ts";

afterEach(() => {
  document.body.replaceChildren();
});

function deriveItemsStore(
  store: ReturnType<typeof createCollectionStore>,
  kind: "collection" | "picked" | "omitted",
) {
  if (kind === "picked") {
    return pick(store, ["items"]);
  }
  if (kind === "omitted") {
    return omit(store, ["renderedItems"]);
  }
  return store;
}

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

test("treats registration snapshots reused reentrantly as controlled", async () => {
  const parent = createCollectionStore<{ id: string }>();
  const staleStore = createCollectionStore({ store: parent });
  const stop = init(parent);
  const banana = { id: "banana" };
  const stopSync = sync(parent, ["items"], ({ items }) => {
    if (!items.includes(banana)) return;
    staleStore.setState("items", items);
  });

  try {
    const unregister = parent.registerItem(banana);
    await expect.poll(() => staleStore.getState().items).toContain(banana);

    unregister();

    expect(staleStore.getState().items).toContain(banana);
    expect(staleStore.item("banana")).toBe(banana);
  } finally {
    stopSync();
    stop();
  }
});

test("treats snapshots reasserted on their originating store as controlled", async () => {
  const store = createCollectionStore<{ id: string }>();
  const stop = init(store);
  const banana = { id: "banana" };
  const orange = { id: "orange" };
  let rewroteItems = false;
  const stopSync = sync(store, ["items"], ({ items }) => {
    if (rewroteItems || !items.includes(banana)) return;
    rewroteItems = true;
    store.setState("items", [orange]);
    store.setState("items", items);
  });

  try {
    const unregister = store.registerItem(banana);
    await expect.poll(() => rewroteItems).toBe(true);

    unregister();
    await expect.poll(() => store.getState().items).toEqual([]);

    expect(store.item("banana")).toBe(banana);
  } finally {
    stopSync();
    stop();
  }
});

test("treats snapshots reasserted through parent stores as controlled", async () => {
  const parent = createStore({
    items: [] as Array<{ id: string }>,
    renderedItems: [] as Array<{ id: string }>,
  });
  const store = createCollectionStore({ store: parent });
  const banana = { id: "banana" };
  const orange = { id: "orange" };
  let rewroteItems = false;
  const stopSync = sync(parent, ["items"], ({ items }) => {
    if (rewroteItems || !items.includes(banana)) return;
    rewroteItems = true;
    store.setState("items", [orange]);
    parent.setState("items", items);
  });
  const stop = init(store);

  try {
    const unregister = store.registerItem(banana);
    await expect.poll(() => rewroteItems).toBe(true);

    unregister();
    await expect.poll(() => store.getState().items).toEqual([]);

    expect(store.item("banana")).toBe(banana);
  } finally {
    stop();
    stopSync();
  }
});

test("treats snapshots reasserted before composed store sync as controlled", async () => {
  const parent = createCollectionStore<{ id: string }>();
  const store = createCollectionStore({ store: parent });
  const stopParent = init(parent);
  const banana = { id: "banana" };
  let wroteWhileStale = false;
  const stopSync = sync(parent, ["items"], ({ items }) => {
    if (!items.includes(banana)) return;
    wroteWhileStale = !store.getState().items.includes(banana);
    store.setState("items", items);
  });
  const stopStore = init(store);

  try {
    const unregister = store.registerItem(banana);
    await expect.poll(() => store.getState().items).toContain(banana);

    expect(wroteWhileStale).toBe(true);

    unregister();
    await expect.poll(() => store.getState().items).toEqual([]);

    expect(store.item("banana")).toBe(banana);
  } finally {
    stopStore();
    stopSync();
    stopParent();
  }
});

test("does not control registration snapshots during ancestor initialization", async () => {
  const parent = createCollectionStore<{ id: string }>();
  const store = createCollectionStore({ store: parent });
  const banana = { id: "banana" };
  const unregister = parent.registerItem(banana);
  const stop = init(store);

  try {
    await expect.poll(() => parent.getState().items).toContain(banana);

    unregister();
    await expect.poll(() => parent.getState().items).toEqual([]);
    await expect.poll(() => store.getState().items).toEqual([]);

    expect(parent.item("banana")).toBeNull();
    expect(store.item("banana")).toBeNull();
  } finally {
    stop();
  }
});

test("does not control registration snapshots across composed ancestors", async () => {
  const root = createCollectionStore<{ id: string }>();
  const middle = createCollectionStore({ store: root });
  const leaf = createCollectionStore({ store: middle });
  const stop = init(leaf);

  try {
    const unregister = leaf.registerItem({ id: "banana" });
    await expect.poll(() => root.getState().items).toHaveLength(1);

    unregister();
    await expect.poll(() => leaf.getState().items).toEqual([]);

    expect(root.item("banana")).toBeNull();
    expect(middle.item("banana")).toBeNull();
    expect(leaf.item("banana")).toBeNull();
  } finally {
    stop();
  }
});

test("preserves controlled items across staggered composed initialization", async () => {
  const root = createCollectionStore<{ id: string; value: string }>();
  const middle = createCollectionStore({ store: root });
  const leaf = createCollectionStore({ store: middle });

  const stopRoot = init(root);
  const stopLeaf = init(leaf);
  root.setState("items", [{ id: "item", value: "one" }]);
  stopLeaf();

  const stopMiddle = init(middle);
  root.setState("items", [{ id: "item", value: "two" }]);
  stopMiddle();

  const controlledItem = { id: "item", value: "three" };
  root.setState("items", [controlledItem]);
  const registeredItem = { id: "registered", value: "live" };
  const unregister = root.registerItem(registeredItem);
  await expect.poll(() => root.getState().items).toEqual([registeredItem]);

  expect(root.item("item")).toBe(controlledItem);
  expect(middle.item("item")).toBe(controlledItem);
  expect(leaf.item("item")).toBe(controlledItem);

  const stop = init(leaf);

  try {
    expect(root.item("item")).toBe(controlledItem);
    expect(middle.item("item")).toBe(controlledItem);
    expect(leaf.item("item")).toBe(controlledItem);

    unregister();

    expect(root.item("registered")).toBeNull();
    expect(middle.item("registered")).toBeNull();
    expect(leaf.item("registered")).toBeNull();

    await expect.poll(() => root.getState().items).toEqual([]);

    expect(root.item("item")).toBe(controlledItem);
    expect(middle.item("item")).toBe(controlledItem);
    expect(leaf.item("item")).toBe(controlledItem);
  } finally {
    stop();
    stopRoot();
  }
});

test("preserves controlled items across composed parent registration flushes", async () => {
  const parent = createCollectionStore<{ id: string; value: string }>();
  const store = createCollectionStore({ store: parent });
  const stop = init(store);

  try {
    const orange = { id: "orange", value: "Orange" };
    parent.setState("items", [orange]);

    const banana = { id: "banana", value: "Banana" };
    const unregister = parent.registerItem(banana);
    await expect.poll(() => parent.getState().items).toContain(banana);

    expect(parent.item("orange")).toBe(orange);
    expect(store.item("orange")).toBe(orange);

    unregister();

    expect(parent.item("banana")).toBeNull();
    expect(store.item("banana")).toBeNull();

    await expect.poll(() => parent.getState().items).toEqual([]);

    expect(parent.item("orange")).toBe(orange);
    expect(store.item("orange")).toBe(orange);
  } finally {
    stop();
  }
});

test("synchronizes items through composite parent stores", () => {
  const parent = createCompositeStore<{ id: string }>();
  const store = createCollectionStore({ store: parent });
  const stop = init(store);

  try {
    const apple = { id: "apple" };
    store.setState("items", [apple]);

    expect(parent.getState().items).toEqual([apple]);
    expect(store.getState().items).toEqual([apple]);
    expect(parent.item("apple")).toBe(apple);
    expect(store.item("apple")).toBe(apple);
  } finally {
    stop();
  }
});

test.each([
  ["collection", "apple"],
  ["picked", undefined],
  ["omitted", undefined],
] as const)(
  "preserves parent listener lookup timing through %s stores",
  (kind, expectedItemId) => {
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
    const derivedStore = deriveItemsStore(store, kind);

    derivedStore.setState("items", (items) => [...items, { id: "apple" }]);

    expect(observedIds).toEqual(["apple", expectedItemId]);
    stopSync();
  },
);

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

test("indexes child-controlled items once across composed stores", () => {
  const parent = createCollectionStore();
  const store = createCollectionStore({ store: parent });
  const stores = Array.from({ length: 9 }, () =>
    createCollectionStore({ store: parent }),
  );
  const stops = [init(parent), init(store), ...stores.map(init)];
  let idReads = 0;
  const items = Array.from({ length: 100 }, (_, index) => ({
    get id() {
      idReads += 1;
      return `item-${index + 1}`;
    },
  }));

  try {
    store.setState("items", items);

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
