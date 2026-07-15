import { init } from "@ariakit/store";
import { expect, test } from "vitest";
import { createComboboxStore } from "../combobox/combobox-store.ts";
import { createSelectStore } from "../select/select-store.ts";
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

test("syncs activeId on the first setSelectedId with a select parent", async () => {
  const select = createSelectStore();
  const store = createTabStore({
    composite: select,
    defaultSelectedId: "tab-1",
  });
  const stop = init(store);

  try {
    store.setSelectedId("tab-2");
    await flushBatch();

    expect(store.getState().selectedId).toBe("tab-2");
    expect(store.getState().activeId).toBe("tab-2");
  } finally {
    stop();
  }
});

test("syncs activeId on the first setSelectedId after a popover toggle", async () => {
  const select = createSelectStore();
  const store = createTabStore({
    composite: select,
    defaultSelectedId: "tab-1",
  });
  const stop = init(store);

  try {
    select.setOpen(true);
    select.setOpen(false);
    await flushBatch();

    store.setSelectedId("tab-2");
    await flushBatch();

    expect(store.getState().activeId).toBe("tab-2");
  } finally {
    stop();
  }
});

test("skips the activeId sync when restoring selectedId on popover toggle", async () => {
  const select = createSelectStore();
  const store = createTabStore({
    composite: select,
    defaultSelectedId: "tab-1",
  });
  const stop = init(store);

  try {
    store.setSelectedId("tab-2");
    await flushBatch();

    select.setOpen(true);
    await flushBatch();

    expect(store.getState().selectedId).toBe("tab-1");
    expect(store.getState().activeId).toBe("tab-2");
  } finally {
    stop();
  }
});

test("syncs activeId when a restore shares a flush with a later setSelectedId", async () => {
  const select = createSelectStore();
  const store = createTabStore({
    composite: select,
    defaultSelectedId: "tab-1",
  });
  const stop = init(store);

  try {
    store.setSelectedId("tab-2");
    await flushBatch();

    select.setOpen(true);
    store.setSelectedId("tab-3");
    await flushBatch();

    expect(store.getState().selectedId).toBe("tab-3");
    expect(store.getState().activeId).toBe("tab-3");
  } finally {
    stop();
  }
});

test("does not leak a restore armed right before the store is destroyed", async () => {
  const combobox = createComboboxStore({ defaultOpen: true });
  const store = createTabStore({ combobox, defaultSelectedId: "tab-1" });
  const stop = init(store);

  try {
    combobox.setState("selectedValue", "value");
    store.setSelectedId("tab-2");
    await flushBatch();

    expect(store.getState().activeId).toBe("tab-2");

    combobox.setOpen(false);
    stop();
    await flushBatch();
  } finally {
    stop();
  }

  const restart = init(store);

  try {
    await flushBatch();
    expect(store.getState().selectedId).toBe("tab-1");

    store.setSelectedId("tab-3");
    await flushBatch();

    expect(store.getState().selectedId).toBe("tab-3");
    expect(store.getState().activeId).toBe("tab-3");
  } finally {
    restart();
  }
});
