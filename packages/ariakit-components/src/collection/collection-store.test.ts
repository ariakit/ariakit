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

test("keeps registered item metadata when explicit item state is pruned", async () => {
  const store = createCollectionStore<{
    id: string;
    value?: string;
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
