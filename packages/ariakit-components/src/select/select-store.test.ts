import { init } from "@ariakit/store";
import { expect, test } from "vitest";
import { createCompositeStore } from "../composite/composite-store.ts";
import { createSelectStore } from "./select-store.ts";
import type { SelectStoreItem } from "./select-store.ts";

function flushBatch() {
  return new Promise<void>((resolve) => queueMicrotask(resolve));
}

const apple: SelectStoreItem = { id: "apple", value: "Apple" };
const banana: SelectStoreItem = { id: "banana", value: "Banana" };

test("sets the value only from eligible late public items", async () => {
  const store = createSelectStore({ defaultValue: "Orange" });
  const stop = init(store);

  try {
    store.setState("items", [
      { id: "disabled", value: "Disabled", disabled: true },
      { id: "valueless" },
      apple,
    ]);
    store.move("disabled");
    await flushBatch();

    expect(store.getState().value).toBe("Orange");

    store.move("valueless");
    await flushBatch();

    expect(store.getState().value).toBe("Orange");

    store.move("apple");
    await flushBatch();

    expect(store.getState().value).toBe("Apple");
  } finally {
    stop();
  }
});

test("does not set the value from an item unregistered after moving", async () => {
  const store = createSelectStore({ defaultValue: "Orange" });
  const stop = init(store);

  try {
    const unregister = store.registerItem(apple);
    await flushBatch();

    store.move("apple");
    unregister();
    await flushBatch();

    expect(store.getState().items).toEqual([]);
    expect(store.getState().value).toBe("Orange");
  } finally {
    stop();
  }
});

test("sets the value from an unregistered item in a composed store", async () => {
  const composite = createCompositeStore<SelectStoreItem>();
  const store = createSelectStore({ store: composite, defaultValue: "Orange" });
  const stop = init(store);

  try {
    composite.setState("items", [apple]);
    composite.move("apple");
    await flushBatch();

    expect(store.getState().value).toBe("Apple");
  } finally {
    stop();
  }
});

test("does not use an item added after moving", async () => {
  const store = createSelectStore({ defaultValue: "Orange" });
  const stop = init(store);

  try {
    store.move("apple");
    queueMicrotask(() => {
      store.setState("items", [apple]);
    });
    await flushBatch();

    expect(store.getState().value).toBe("Orange");
  } finally {
    stop();
  }
});

test("prefers newly registered item metadata", async () => {
  const store = createSelectStore({ defaultValue: "Orange" });
  const stop = init(store);

  try {
    store.setState("items", [apple]);
    store.move("apple");
    queueMicrotask(() => {
      store.registerItem({ ...apple, disabled: true });
    });
    await flushBatch();

    expect(store.getState().value).toBe("Orange");
  } finally {
    stop();
  }
});

test("does not overwrite a value set after moving", async () => {
  const store = createSelectStore({ defaultValue: "Orange" });
  const stop = init(store);

  try {
    store.setState("items", [apple]);
    store.move("apple");
    queueMicrotask(() => store.setValue("Banana"));
    await flushBatch();

    expect(store.getState().value).toBe("Banana");
  } finally {
    stop();
  }
});

test("does not set the value after the active id changes", async () => {
  const store = createSelectStore({ defaultValue: "Orange" });
  const stop = init(store);

  try {
    store.setState("items", [apple, banana]);
    store.move("apple");
    queueMicrotask(() => store.setActiveId("banana"));
    await flushBatch();

    expect(store.getState().activeId).toBe("banana");
    expect(store.getState().value).toBe("Orange");
  } finally {
    stop();
  }
});

test("does not set the value after the store is destroyed", async () => {
  const store = createSelectStore({ defaultValue: "Orange" });
  const stop = init(store);

  store.setState("items", [apple]);
  store.move("apple");
  queueMicrotask(stop);
  await flushBatch();

  expect(store.getState().value).toBe("Orange");
});
