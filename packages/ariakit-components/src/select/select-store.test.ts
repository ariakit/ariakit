import { createStore, init, mergeStore, pick } from "@ariakit/store";
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

test("does not overwrite a reasserted value after moving", async () => {
  const store = createSelectStore({ defaultValue: "Orange" });
  const stop = init(store);

  try {
    store.setState("items", [apple]);
    store.move("apple");
    queueMicrotask(() => store.setValue("Orange"));
    await flushBatch();

    expect(store.getState().value).toBe("Orange");
  } finally {
    stop();
  }
});

test("does not overwrite a value reasserted with setState", async () => {
  const store = createSelectStore({ defaultValue: "Orange" });
  const stop = init(store);

  try {
    store.setState("items", [apple]);
    store.move("apple");
    queueMicrotask(() => store.setState("value", "Orange"));
    await flushBatch();

    expect(store.getState().value).toBe("Orange");
  } finally {
    stop();
  }
});

test.each([
  ["setValue", "parent"],
  ["setValue", "child"],
  ["setState", "parent"],
  ["setState", "child"],
] as const)(
  "does not overwrite a value reasserted with %s by a synchronized %s store",
  async (method, target) => {
    const parent = createSelectStore({ defaultValue: "Orange" });
    const child = createSelectStore({ store: parent });
    const stop = init(child);

    try {
      child.setState("items", [apple]);
      child.move("apple");
      queueMicrotask(() => {
        const store = target === "parent" ? parent : child;
        if (method === "setValue") {
          store.setValue("Orange");
        } else {
          store.setState("value", "Orange");
        }
      });
      await flushBatch();

      expect(parent.getState().value).toBe("Orange");
      expect(child.getState().value).toBe("Orange");
    } finally {
      stop();
    }
  },
);

test("does not overwrite a value reasserted by a sibling store", async () => {
  const backing = createStore<{ value: string }>({ value: "Orange" });
  const writer = createSelectStore({ store: backing });
  const mover = createSelectStore({ store: backing });
  const stopWriter = init(writer);
  const stopMover = init(mover);

  try {
    mover.setState("items", [apple]);
    mover.move("apple");
    queueMicrotask(() => writer.setValue("Orange"));
    await flushBatch();

    expect(backing.getState().value).toBe("Orange");
    expect(writer.getState().value).toBe("Orange");
    expect(mover.getState().value).toBe("Orange");
  } finally {
    stopMover();
    stopWriter();
  }
});

test.each([
  ["public", false],
  ["registered", true],
] as const)(
  "does not overwrite a value reasserted across derived stores with a %s item",
  async (_, registered) => {
    const backing = createStore({ value: "Orange" });
    const writer = createSelectStore({
      store: pick(backing, ["value"]),
    });
    const mover = createSelectStore({
      store: pick(backing, ["value"]),
    });
    const stopWriter = init(writer);
    const stopMover = init(mover);
    const unregister = registered ? mover.registerItem(apple) : undefined;

    try {
      if (!registered) {
        mover.setState("items", [apple]);
      }
      mover.move("apple");
      queueMicrotask(() => writer.setValue("Orange"));
      await flushBatch();

      expect(backing.getState().value).toBe("Orange");
      expect(writer.getState().value).toBe("Orange");
      expect(mover.getState().value).toBe("Orange");
    } finally {
      unregister?.();
      stopMover();
      stopWriter();
    }
  },
);

test.each([
  ["public", false],
  ["registered", true],
] as const)(
  "does not share value writes through a synchronized store with a %s item",
  async (_, registered) => {
    const composite = createCompositeStore<SelectStoreItem>();
    const writer = createSelectStore({
      store: composite,
      defaultValue: "Orange",
    });
    const mover = createSelectStore({
      store: composite,
      defaultValue: "Orange",
    });
    const stopWriter = init(writer);
    const stopMover = init(mover);
    const unregister = registered ? mover.registerItem(apple) : undefined;

    try {
      if (!registered) {
        mover.setState("items", [apple]);
      }
      mover.move("apple");
      queueMicrotask(() => writer.setValue("Orange"));
      await flushBatch();

      expect(writer.getState().value).toBe("Orange");
      expect(mover.getState().value).toBe("Apple");
    } finally {
      unregister?.();
      stopMover();
      stopWriter();
    }
  },
);

test("does not share value writes between merged parent stores", async () => {
  const writerBacking = createStore({ value: "Orange" });
  const moverBacking = createStore({ value: "Orange" });
  const writer = createSelectStore({ store: writerBacking });
  const mover = createSelectStore({ store: moverBacking });
  const bridge = createSelectStore({
    store: mergeStore(writerBacking, moverBacking),
  });
  const stopWriter = init(writer);
  const stopMover = init(mover);
  const stopBridge = init(bridge);

  try {
    mover.setState("items", [apple]);
    mover.move("apple");
    queueMicrotask(() => writer.setValue("Orange"));
    await flushBatch();

    expect(writer.getState().value).toBe("Orange");
    expect(mover.getState().value).toBe("Apple");
    expect(bridge.getState().value).toBe("Apple");
  } finally {
    stopBridge();
    stopMover();
    stopWriter();
  }
});

test("does not overwrite a value that changes back after moving", async () => {
  const store = createSelectStore({
    defaultValue: "Orange",
    setValueOnMove: true,
  });
  const stop = init(store);

  try {
    store.show();
    await flushBatch();

    store.setState("items", [apple, banana]);
    store.move("apple");
    queueMicrotask(() => {
      store.setValue("Banana");
      store.setValue("Orange");
    });
    await flushBatch();

    expect(store.getState().mounted).toBe(true);
    expect(store.getState().activeId).toBe("apple");
    expect(store.getState().value).toBe("Orange");
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
