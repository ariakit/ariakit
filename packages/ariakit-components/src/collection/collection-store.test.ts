import { init } from "@ariakit/store";
import { afterEach, expect, test } from "vitest";
import { createCollectionStore } from "./collection-store.ts";

afterEach(() => {
  document.body.replaceChildren();
});

function throwOnFind(items: unknown[]) {
  Object.defineProperty(items, "find", {
    configurable: true,
    value() {
      throw new Error("item() should use the lookup map");
    },
  });
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

    await expect.poll(() => store.getState().items).toEqual([]);
    expect(store.item("item")).toBeNull();
  } finally {
    stop();
  }
});

test("gets items from explicit item state updates", async () => {
  const store = createCollectionStore<{ id: string; value?: string }>();

  store.setState("items", [{ id: "item", value: "one" }]);

  expect(store.item("item")).toEqual({ id: "item", value: "one" });

  store.setState("items", [{ id: "item", value: "two" }]);

  expect(store.item("item")).toEqual({ id: "item", value: "two" });

  const stop = init(store);

  try {
    const unregister = store.registerItem({ id: "item" });

    await expect
      .poll(() => store.getState().items)
      .toEqual([{ id: "item", value: "two" }]);
    expect(store.item("item")).toEqual({ id: "item", value: "two" });

    unregister();

    await expect
      .poll(() => store.getState().items)
      .toEqual([{ id: "item", value: "two" }]);
    expect(store.item("item")).toEqual({ id: "item", value: "two" });

    store.setState("items", []);

    expect(store.item("item")).toBeNull();
  } finally {
    stop();
  }
});

test("gets items from the lookup map", async () => {
  const items = Array.from({ length: 1_000 }, (_, index) => ({
    id: `item-${index}`,
  }));
  const item = items[items.length - 1];

  if (!item) {
    throw new Error("Missing test item");
  }

  const store = createCollectionStore({ defaultItems: items });

  throwOnFind(items);
  expect(store.item(item.id)).toBe(item);

  const nextItems = [{ id: "item", value: "updated" }];
  const nextItem = nextItems[0];

  if (!nextItem) {
    throw new Error("Missing test item");
  }

  store.setState("items", nextItems);

  throwOnFind(nextItems);
  expect(store.item(nextItem.id)).toBe(nextItem);

  const mountedStore = createCollectionStore<{
    id: string;
    value?: string;
  }>();
  const stop = init(mountedStore);

  try {
    const unregister = mountedStore.registerItem({
      id: "registered",
      value: "mounted",
    });

    await expect
      .poll(() => mountedStore.getState().items)
      .toEqual([{ id: "registered", value: "mounted" }]);

    throwOnFind(mountedStore.getState().items);
    expect(mountedStore.item("registered")).toEqual({
      id: "registered",
      value: "mounted",
    });

    unregister();
  } finally {
    stop();
  }
});

test("merges rendered metadata for items seeded before any divergence", async () => {
  const store = createCollectionStore<{
    id: string;
    label?: string;
    element?: HTMLElement | null;
  }>({ defaultItems: [{ id: "item", label: "Item" }] });
  const stop = init(store);
  const element = document.createElement("button");

  try {
    // The item is already in the public `items` state (seeded by defaultItems)
    // and has never diverged, so it takes the incremental lookup-map path.
    // Rendering it attaches an element that must be visible through item()
    // synchronously, before the private batch republishes — matching the
    // behavior when the public state is the authority for the item's own id.
    const unrender = store.renderItem({ id: "item", element });
    expect(store.item("item")).toEqual({ id: "item", label: "Item", element });

    await expect
      .poll(() => store.getState().items)
      .toEqual([{ id: "item", label: "Item", element }]);
    expect(store.item("item")).toEqual({ id: "item", label: "Item", element });

    unrender();

    await expect
      .poll(() => store.getState().items)
      .toEqual([{ id: "item", label: "Item" }]);
    expect(store.item("item")).toEqual({ id: "item", label: "Item" });
  } finally {
    stop();
  }
});

test("keeps explicit item state updates before init", async () => {
  const store = createCollectionStore({
    defaultItems: [{ id: "item" }],
  });

  store.setState("items", []);

  const stop = init(store);

  try {
    await expect.poll(() => store.getState().items).toEqual([]);
    expect(store.item("item")).toBeNull();
  } finally {
    stop();
  }
});

test("keeps explicit item state updates before private batches flush", async () => {
  const store = createCollectionStore<{ id: string; value?: string }>();
  const stop = init(store);

  try {
    const unregister = store.registerItem({
      id: "item",
      value: "registered",
    });

    expect(store.item("item")).toEqual({
      id: "item",
      value: "registered",
    });

    store.setState("items", [{ id: "item", value: "public" }]);

    expect(store.item("item")).toEqual({ id: "item", value: "public" });

    await expect
      .poll(() => store.getState().items)
      .toEqual([{ id: "item", value: "public" }]);
    expect(store.item("item")).toEqual({ id: "item", value: "public" });

    unregister();

    await expect
      .poll(() => store.getState().items)
      .toEqual([{ id: "item", value: "public" }]);

    const unregisterAgain = store.registerItem({
      id: "item",
      value: "registered",
    });

    store.setState("items", []);

    await expect.poll(() => store.getState().items).toEqual([]);
    expect(store.item("item")).toBeNull();

    unregisterAgain();

    await expect.poll(() => store.getState().items).toEqual([]);
  } finally {
    stop();
  }
});

test("keeps registered item metadata in explicit item lookups", async () => {
  const store = createCollectionStore<{
    id: string;
    value?: string;
    label?: string;
    element?: HTMLElement | null;
  }>();
  const stop = init(store);
  const element = document.createElement("button");

  try {
    store.setState("items", [{ id: "item", value: "two" }]);

    expect(store.item("item")).toEqual({ id: "item", value: "two" });

    const unrender = store.renderItem({ id: "item", element });
    expect(store.item("item")).toEqual({ id: "item", value: "two", element });
    await expect
      .poll(() => store.getState().items)
      .toEqual([{ id: "item", value: "two", element }]);
    expect(store.item("item")).toEqual({ id: "item", value: "two", element });

    store.setState("items", [{ id: "item", value: "three" }]);

    await expect
      .poll(() => store.getState().items)
      .toEqual([{ id: "item", value: "three" }]);
    expect(store.item("item")).toEqual({
      id: "item",
      value: "three",
      element,
    });

    unrender();

    await expect
      .poll(() => store.getState().items)
      .toEqual([{ id: "item", value: "three" }]);
    expect(store.item("item")).toEqual({ id: "item", value: "three" });

    const unrenderAgain = store.renderItem({ id: "item", element });
    await expect
      .poll(() => store.getState().items)
      .toEqual([{ id: "item", value: "three", element }]);

    store.setState("items", [{ id: "item" }]);

    await expect.poll(() => store.getState().items).toEqual([{ id: "item" }]);
    expect(store.item("item")).toEqual({ id: "item", element });

    store.setState("items", []);

    expect(store.item("item")).toBeNull();

    unrenderAgain();

    await expect.poll(() => store.getState().items).toEqual([]);
    expect(store.item("item")).toBeNull();
  } finally {
    stop();
  }
});

test("does not restore registration metadata after explicit item updates", async () => {
  const store = createCollectionStore<{
    id: string;
    value?: string;
    label?: string;
    element?: HTMLElement | null;
  }>();
  const stop = init(store);
  const element = document.createElement("button");

  try {
    store.setState("items", [{ id: "item", value: "one" }]);

    const unrender = store.renderItem({
      id: "item",
      value: "two",
      element,
    });

    await expect
      .poll(() => store.getState().items)
      .toEqual([{ id: "item", value: "two", element }]);

    store.setState("items", [{ id: "item", value: "two" }]);

    expect(store.item("item")).toEqual({ id: "item", value: "two", element });

    unrender();

    await expect
      .poll(() => store.getState().items)
      .toEqual([{ id: "item", value: "two" }]);
    expect(store.item("item")).toEqual({ id: "item", value: "two" });
  } finally {
    stop();
  }
});

test("keeps rendered item metadata in explicit item updates", async () => {
  const store = createCollectionStore<{
    id: string;
    value?: string;
    label?: string;
    disabled?: boolean;
    rowId?: string;
    element?: HTMLElement | null;
  }>();
  const stop = init(store);
  const element = document.createElement("button");

  try {
    store.setState("items", [{ id: "item", value: "one", label: "Initial" }]);

    const unrender = store.renderItem({
      id: "item",
      value: undefined,
      disabled: true,
      rowId: "row",
      element,
    });

    await expect
      .poll(() => store.getState().items)
      .toEqual([
        {
          id: "item",
          value: undefined,
          label: "Initial",
          disabled: true,
          rowId: "row",
          element,
        },
      ]);

    store.setState("items", [{ id: "item", value: "two", label: "Updated" }]);

    await expect
      .poll(() => store.getState().items)
      .toEqual([{ id: "item", value: "two", label: "Updated" }]);
    expect(store.item("item")).toEqual({
      id: "item",
      value: "two",
      label: "Updated",
      disabled: true,
      rowId: "row",
      element,
    });

    unrender();

    await expect
      .poll(() => store.getState().items)
      .toEqual([{ id: "item", value: "two", label: "Updated" }]);
    expect(store.item("item")).toEqual({
      id: "item",
      value: "two",
      label: "Updated",
    });
  } finally {
    stop();
  }
});

test("keeps registered item metadata when explicit item state is pruned", async () => {
  const store = createCollectionStore<{
    id: string;
    value?: string;
    label?: string;
    element?: HTMLElement | null;
  }>();
  const stop = init(store);
  const first = document.createElement("button");
  const second = document.createElement("button");
  const third = document.createElement("button");
  document.body.append(first, second, third);

  try {
    store.setState("items", [{ id: "first" }, { id: "second" }]);

    const unrenderFirst = store.renderItem({ id: "first", element: first });
    const unrenderSecond = store.renderItem({
      id: "second",
      element: second,
    });

    await expect
      .poll(() => store.getState().items)
      .toEqual([
        { id: "first", element: first },
        { id: "second", element: second },
      ]);

    store.setState("items", [{ id: "first" }, { id: "second", value: "two" }]);

    expect(store.item("first")).toEqual({ id: "first", element: first });
    expect(store.item("second")).toEqual({
      id: "second",
      value: "two",
      element: second,
    });

    const unrenderThird = store.renderItem({ id: "third", element: third });

    await expect
      .poll(() => store.getState().items)
      .toEqual([
        { id: "first", element: first },
        { id: "second", value: "two", element: second },
        { id: "third", element: third },
      ]);

    store.setState("items", [{ id: "first" }]);

    expect(store.item("first")).toEqual({ id: "first", element: first });
    expect(store.item("second")).toBeNull();
    expect(store.item("third")).toBeNull();

    unrenderFirst();

    await expect.poll(() => store.getState().items).toEqual([{ id: "first" }]);
    expect(store.item("first")).toEqual({ id: "first" });
    expect(store.item("second")).toBeNull();
    expect(store.item("third")).toBeNull();

    unrenderSecond();
    unrenderThird();

    await expect.poll(() => store.getState().items).toEqual([{ id: "first" }]);

    store.setState("items", []);

    expect(store.item("first")).toBeNull();

    unrenderFirst();

    await expect.poll(() => store.getState().items).toEqual([]);
    expect(store.item("first")).toBeNull();
  } finally {
    stop();
  }
});

test("does not republish stale private items after explicit item updates", async () => {
  const store = createCollectionStore<{
    id: string;
    element?: HTMLElement | null;
  }>();
  const stop = init(store);
  const first = document.createElement("button");
  const second = document.createElement("button");
  const third = document.createElement("button");

  try {
    store.setState("items", [{ id: "first" }, { id: "second" }]);

    const unrenderFirst = store.renderItem({ id: "first", element: first });
    const unrenderSecond = store.renderItem({
      id: "second",
      element: second,
    });

    await expect
      .poll(() => store.getState().items)
      .toEqual([
        { id: "first", element: first },
        { id: "second", element: second },
      ]);

    store.setState("items", []);

    expect(store.item("first")).toBeNull();
    expect(store.item("second")).toBeNull();

    const unrenderThird = store.renderItem({ id: "third", element: third });

    await expect
      .poll(() => store.getState().items)
      .toEqual([{ id: "third", element: third }]);
    expect(store.item("first")).toBeNull();
    expect(store.item("second")).toBeNull();
    expect(store.item("third")).toEqual({ id: "third", element: third });

    unrenderFirst();
    unrenderSecond();

    await expect
      .poll(() => store.getState().items)
      .toEqual([{ id: "third", element: third }]);
    expect(store.item("first")).toBeNull();
    expect(store.item("second")).toBeNull();

    unrenderThird();

    await expect.poll(() => store.getState().items).toEqual([]);
    expect(store.item("third")).toBeNull();
  } finally {
    stop();
  }
});

test("registers multiple rendered items synchronously", async () => {
  const store = createCollectionStore();
  const stop = init(store);
  const first = document.createElement("button");
  const second = document.createElement("button");

  try {
    const unrenderFirst = store.renderItem({ id: "first", element: first });
    expect(store.item("first")).toEqual({ id: "first", element: first });
    const unrenderSecond = store.renderItem({
      id: "second",
      element: second,
    });
    expect(store.item("first")).toEqual({ id: "first", element: first });
    expect(store.item("second")).toEqual({ id: "second", element: second });

    await expect
      .poll(() => store.getState().items)
      .toEqual([
        { id: "first", element: first },
        { id: "second", element: second },
      ]);
    expect(store.item("first")).toEqual({ id: "first", element: first });
    expect(store.item("second")).toEqual({ id: "second", element: second });

    unrenderFirst();
    unrenderSecond();

    await expect.poll(() => store.getState().items).toEqual([]);
  } finally {
    stop();
  }
});

test("keeps private item metadata updates before batches flush", async () => {
  const store = createCollectionStore<{
    id: string;
    value?: string;
    label?: string;
    element?: HTMLElement | null;
  }>();
  const stop = init(store);
  const first = document.createElement("button");
  const second = document.createElement("button");
  const third = document.createElement("button");

  try {
    const unrenderFirst = store.renderItem({ id: "first", element: first });
    const unrenderSecond = store.renderItem({
      id: "second",
      element: second,
    });
    const unrenderThird = store.renderItem({ id: "third", element: third });

    await expect
      .poll(() => store.getState().items)
      .toEqual([
        { id: "first", element: first },
        { id: "second", element: second },
        { id: "third", element: third },
      ]);

    const restoreFirst = store.renderItem({
      id: "first",
      value: "one",
      element: first,
    });
    const updateFirst = store.renderItem({
      id: "first",
      label: "First",
      element: first,
    });
    const restoreThird = store.renderItem({
      id: "third",
      value: "three",
      element: third,
    });

    await expect
      .poll(() => store.getState().items)
      .toEqual([
        { id: "first", value: "one", label: "First", element: first },
        { id: "second", element: second },
        { id: "third", value: "three", element: third },
      ]);
    expect(store.item("first")).toEqual({
      id: "first",
      value: "one",
      label: "First",
      element: first,
    });
    expect(store.item("third")).toEqual({
      id: "third",
      value: "three",
      element: third,
    });

    updateFirst();
    restoreFirst();
    restoreThird();
    unrenderFirst();
    unrenderSecond();
    unrenderThird();

    await expect.poll(() => store.getState().items).toEqual([]);
  } finally {
    stop();
  }
});

test("keeps current item metadata after explicit state mismatch", async () => {
  const store = createCollectionStore<{
    id: string;
    value?: string;
    label?: string;
  }>();
  const stop = init(store);

  try {
    const unregisterStale = store.registerItem({
      id: "stale",
      value: "stale",
    });

    await expect
      .poll(() => store.getState().items)
      .toEqual([{ id: "stale", value: "stale" }]);

    store.setState("items", []);

    expect(store.item("stale")).toBeNull();

    const unregisterItem = store.registerItem({
      id: "item",
      value: "one",
    });
    const restoreItem = store.registerItem({
      id: "item",
      label: "Item",
    });

    await expect
      .poll(() => store.getState().items)
      .toEqual([{ id: "item", value: "one", label: "Item" }]);
    expect(store.item("stale")).toBeNull();
    expect(store.item("item")).toEqual({
      id: "item",
      value: "one",
      label: "Item",
    });

    unregisterStale();
    restoreItem();
    unregisterItem();

    await expect.poll(() => store.getState().items).toEqual([]);
  } finally {
    stop();
  }
});

test("does not revert controlled item metadata when overlapping registrations clean up", async () => {
  const store = createCollectionStore<{
    id: string;
    value?: string;
    label?: string;
  }>();
  const stop = init(store);

  try {
    const unregister = store.registerItem({ id: "item", value: "old" });
    const restore = store.registerItem({ id: "item", label: "extra" });

    await expect
      .poll(() => store.getState().items)
      .toEqual([{ id: "item", value: "old", label: "extra" }]);

    // Controlled state diverges to brand-new metadata.
    store.setState("items", [{ id: "item", value: "new", label: "new" }]);
    expect(store.item("item")).toEqual({
      id: "item",
      value: "new",
      label: "new",
    });

    // Cleaning up the first registration republishes private state, then the
    // second registration's cleanup must not restore its pre-divergence
    // snapshot over the authoritative controlled metadata.
    unregister();
    await expect
      .poll(() => store.getState().items)
      .toEqual([{ id: "item", value: "new", label: "new" }]);

    restore();
    await expect
      .poll(() => store.getState().items)
      .toEqual([{ id: "item", value: "new", label: "new" }]);
    expect(store.item("item")).toEqual({
      id: "item",
      value: "new",
      label: "new",
    });
  } finally {
    stop();
  }
});

test("strips overlapping registration metadata added after a divergence", async () => {
  const store = createCollectionStore<{
    id: string;
    value?: string;
    label?: string;
  }>();
  const stop = init(store);

  try {
    // Diverge then settle, so the store has diverged but public state no longer
    // disagrees with the upcoming registrations.
    store.setState("items", [{ id: "other", value: "other" }]);
    await expect
      .poll(() => store.getState().items)
      .toEqual([{ id: "other", value: "other" }]);
    store.setState("items", []);
    await expect.poll(() => store.getState().items).toEqual([]);

    // Overlapping registrations for the same id, entirely after the divergence.
    const unregister = store.registerItem({ id: "item", value: "one" });
    const restore = store.registerItem({ id: "item", label: "two" });

    await expect
      .poll(() => store.getState().items)
      .toEqual([{ id: "item", value: "one", label: "two" }]);

    // Cleaning up the later registration strips only its own contribution.
    restore();
    await expect
      .poll(() => store.getState().items)
      .toEqual([{ id: "item", value: "one" }]);
    expect(store.item("item")).toEqual({ id: "item", value: "one" });

    unregister();
    await expect.poll(() => store.getState().items).toEqual([]);
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
