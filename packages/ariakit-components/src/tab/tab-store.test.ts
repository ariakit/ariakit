import { init } from "@ariakit/store";
import { expect, test } from "vitest";
import { createTabStore } from "./tab-store.ts";

function flushBatch() {
  return new Promise<void>((resolve) => queueMicrotask(resolve));
}

test("gets a panel by tab id", async () => {
  const store = createTabStore();
  const stop = init(store.panels);

  try {
    expect(store.panel("tab-1")).toBeNull();

    const unregisterPanel1 = store.panels.registerItem({
      id: "panel-1",
      tabId: "tab-1",
    });
    const unregisterPanel2 = store.panels.registerItem({
      id: "panel-2",
      tabId: "tab-1",
    });
    await flushBatch();

    expect(store.panel("tab-1")?.id).toBe("panel-1");

    unregisterPanel1();
    await flushBatch();

    expect(store.panel("tab-1")?.id).toBe("panel-2");

    unregisterPanel2();
    await flushBatch();

    expect(store.panel("tab-1")).toBeNull();
  } finally {
    stop();
  }
});

test("keeps panel lookups in items order when panel tab ids change", async () => {
  const store = createTabStore();
  const stop = init(store.panels);

  try {
    const unregisterPanel1 = store.panels.registerItem({
      id: "panel-1",
      tabId: "tab-1",
    });
    const unregisterPanel2 = store.panels.registerItem({
      id: "panel-2",
      tabId: "tab-2",
    });
    await flushBatch();

    expect(store.panel("tab-1")?.id).toBe("panel-1");
    expect(store.panel("tab-2")?.id).toBe("panel-2");

    const restorePanel1 = store.panels.registerItem({
      id: "panel-1",
      tabId: "tab-2",
    });
    await flushBatch();

    expect(store.panel("tab-1")).toBeNull();
    expect(store.panel("tab-2")?.id).toBe("panel-1");

    restorePanel1();
    await flushBatch();

    expect(store.panel("tab-1")?.id).toBe("panel-1");
    expect(store.panel("tab-2")?.id).toBe("panel-2");

    unregisterPanel1();
    unregisterPanel2();
  } finally {
    stop();
  }
});

test("tracks renderItem updates used by orphan panel assignment", async () => {
  const store = createTabStore();
  const stop = init(store.panels);

  try {
    const unrenderPanel = store.panels.renderItem({ id: "panel-1" });
    await flushBatch();

    expect(store.panel("tab-1")).toBeNull();

    store.panels.renderItem({ id: "panel-1", tabId: "tab-1" });
    await flushBatch();

    expect(store.panel("tab-1")?.id).toBe("panel-1");

    unrenderPanel();
    await flushBatch();

    expect(store.panel("tab-1")).toBeNull();
  } finally {
    stop();
  }
});

test("tracks explicit panel item state updates", () => {
  const store = createTabStore();

  store.panels.setState("items", [{ id: "panel-1", tabId: "tab-1" }]);

  expect(store.panel("tab-1")?.id).toBe("panel-1");

  store.panels.setState("items", [
    { id: "panel-1", tabId: "tab-1" },
    { id: "panel-2", tabId: "tab-1" },
  ]);

  expect(store.panel("tab-1")?.id).toBe("panel-1");

  store.panels.setState("items", []);

  expect(store.panel("tab-1")).toBeNull();
});
