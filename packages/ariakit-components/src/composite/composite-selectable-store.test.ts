import { init } from "@ariakit/store";
import { afterEach, expect, test, vi } from "vitest";
import type { SelectableEvent } from "../collection/__selectable-controller.ts";
import type { CompositeSelectableStoreItem } from "./composite-selectable-store.ts";
import { createCompositeSelectableStore } from "./composite-selectable-store.ts";
import { createCompositeStore } from "./composite-store.ts";

const cleanups = new Set<() => void>();

afterEach(() => {
  for (const cleanup of cleanups) {
    cleanup();
  }
  cleanups.clear();
  vi.restoreAllMocks();
});

function initialize<T extends ReturnType<typeof createCompositeStore>>(
  store: T,
) {
  cleanups.add(init(store));
  return store;
}

function createEvent(shiftKey = false): SelectableEvent {
  return {
    ctrlKey: false,
    detail: 1,
    metaKey: false,
    shiftKey,
  };
}

interface StoreOptions {
  items: CompositeSelectableStoreItem[];
  renderedItems?: CompositeSelectableStoreItem[];
  selectableIds?: readonly string[];
}

function createSelectableStore(options: StoreOptions) {
  const store = createCompositeSelectableStore({
    defaultItems: options.items,
  });
  store.setState("renderedItems", options.renderedItems ?? options.items);
  for (const id of options.selectableIds ??
    options.items.map((item) => item.id)) {
    store.unstable_selection.setOptIn(id, true);
  }
  return initialize(store);
}

test("uses stable selectable defaults", () => {
  const store = createSelectableStore({
    items: [{ id: "one" }, { id: "two" }],
  });

  expect(store.getState().selectedIds).toEqual([]);
  expect(store.getState().selectableMode).toBe("multiple");
  expect(store.getState().selectableBehavior).toBe("toggle");
  expect(store.isSelectable("one")).toBe(true);

  store.select("one");
  expect(store.getState().selectedIds).toEqual(["one"]);
  expect(store.isSelected("one")).toBe(true);
  store.toggle("one");
  expect(store.getState().selectedIds).toEqual([]);
});

test("keeps controlled setter updates in the selection mirror", () => {
  const store = createSelectableStore({
    items: [{ id: "one" }, { id: "two" }],
  });
  store.setSelectedIds(["two"]);
  expect(store.isSelected("one")).toBe(false);
  expect(store.isSelected("two")).toBe(true);
});

test("move captures the old active id before extending selection", () => {
  const store = createSelectableStore({
    items: [{ id: "one" }, { id: "two" }, { id: "three" }],
  });

  store.move("one", { anchor: true });
  store.move("three", { extend: true });

  expect(store.getState().activeId).toBe("three");
  expect(store.getState().moves).toBe(2);
  expect(store.getState().selectedIds).toEqual(["one", "two", "three"]);
});

test("activation falls back to the current cursor after its anchor disappears", () => {
  const items = ["one", "two", "three", "four", "five"].map((id) => ({
    id,
  }));
  const store = createSelectableStore({ items });

  store.unstable_selection.activate("one", createEvent());
  store.move("three");
  const remainingItems = items.slice(1);
  store.setState("items", remainingItems);
  store.setState("renderedItems", remainingItems);
  store.unstable_selection.activate("five", createEvent(true));

  expect(store.getState().activeId).toBe("three");
  expect(store.getState().selectedIds).toEqual([
    "one",
    "three",
    "four",
    "five",
  ]);
});

test("move ignores undefined and does not extend through null", () => {
  const store = createSelectableStore({
    items: [{ id: "one" }, { id: "two" }],
  });
  store.move("one", { anchor: true });
  const moves = store.getState().moves;
  store.move(undefined, { extend: true });
  expect(store.getState().moves).toBe(moves);

  store.move(null, { extend: true });
  expect(store.getState().activeId).toBeNull();
  expect(store.getState().selectedIds).toEqual([]);
});

test("an explicit null range source does not coalesce to the active item", () => {
  const store = createSelectableStore({
    items: [{ id: "one" }, { id: "two" }],
  });
  store.move("one");

  store.unstable_selection.extendFrom(null, "two");

  expect(store.getState().selectedIds).toEqual(["two"]);
});

test("plain Composite move accepts and ignores selection options", () => {
  const store = initialize(createCompositeStore());
  store.move("one", { anchor: true, extend: true });
  expect(store.getState().activeId).toBe("one");
  expect(store.getState().moves).toBe(1);
});

test("grid cell endpoints resolve to selectable rows", () => {
  const items: CompositeSelectableStoreItem[] = [
    { id: "row-1" },
    { id: "cell-1", rowId: "row-1" },
    { id: "row-2" },
    { id: "cell-2", rowId: "row-2" },
    { id: "row-3" },
    { id: "cell-3", rowId: "row-3" },
  ];
  const store = createSelectableStore({
    items,
    selectableIds: ["row-1", "row-2", "row-3"],
  });

  store.unstable_selection.activate("cell-1", createEvent());
  store.unstable_selection.activate("cell-3", createEvent(true));
  expect(store.getState().selectedIds).toEqual(["row-1", "row-2", "row-3"]);
  expect(store.isSelected("cell-1")).toBe(false);
  expect(store.isSelected("row-1")).toBe(true);
  store.deselect("cell-1");
  store.toggle("cell-2");
  store.select("cell-3");
  expect(store.getState().selectedIds).toEqual(["row-1", "row-2", "row-3"]);
});

test("horizontal Shift within one grid row keeps one row selected", () => {
  const items: CompositeSelectableStoreItem[] = [
    { id: "row-1" },
    { id: "cell-1a", rowId: "row-1" },
    { id: "cell-1b", rowId: "row-1" },
    { id: "row-2" },
    { id: "cell-2", rowId: "row-2" },
  ];
  const store = createSelectableStore({
    items,
    selectableIds: ["row-1", "row-2"],
  });
  store.setState("selectableBehavior", "replace");

  store.unstable_selection.activate("cell-1a", createEvent());
  store.unstable_selection.activate("cell-1b", createEvent(true));
  expect(store.getState().selectedIds).toEqual(["row-1"]);
});

test("move extends through grid cell containment", () => {
  const items: CompositeSelectableStoreItem[] = [
    { id: "row-1" },
    { id: "cell-1", rowId: "row-1" },
    { id: "row-2" },
    { id: "cell-2", rowId: "row-2" },
  ];
  const store = createSelectableStore({
    items,
    selectableIds: ["row-1", "row-2"],
  });

  store.move("cell-1", { anchor: true });
  store.move("cell-2", { extend: true });
  expect(store.getState().selectedIds).toEqual(["row-1", "row-2"]);
});

test("upward movement extends from row 2 to the cell in row 1", () => {
  const items: CompositeSelectableStoreItem[] = [
    { id: "row-1" },
    { id: "cell-1-1", rowId: "row-1" },
    { id: "row-2" },
    { id: "cell-2-1", rowId: "row-2" },
  ];
  const store = createSelectableStore({
    items,
    selectableIds: ["row-1", "row-2"],
  });

  store.move("cell-2-1", { anchor: true });
  store.move("cell-1-1", { extend: true });

  expect(store.getState().activeId).toBe("cell-1-1");
  expect(store.getState().selectedIds).toEqual(["row-1", "row-2"]);
});

test.each([
  {
    name: "selectable cells in unregistered rows",
    items: [
      { id: "cell-1", rowId: "row-1" },
      { id: "cell-2", rowId: "row-2" },
    ],
    selectableIds: ["cell-1", "cell-2"],
  },
  {
    name: "selectable rows registered under different ids",
    items: [
      { id: "selectable-row-1" },
      { id: "cell-1", rowId: "row-1" },
      { id: "selectable-row-2" },
      { id: "cell-2", rowId: "row-2" },
    ],
    selectableIds: ["selectable-row-1", "selectable-row-2"],
  },
])("warns once for $name in a range", ({ items, selectableIds }) => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const store = createSelectableStore({ items, selectableIds });

  store.move("cell-1", { anchor: true });
  expect(warn).not.toHaveBeenCalled();
  store.move("cell-2", { extend: true });
  store.move("cell-1", { extend: true });

  expect(warn).toHaveBeenCalledOnce();
  expect(warn).toHaveBeenCalledWith(
    "A grid selection range could not resolve the cell's rowId to a selectable row. Give the selectable row item the same id as its CompositeRow.",
  );
});

test("does not warn for flat ranges or valid row containment", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const flatStore = createSelectableStore({
    items: [{ id: "one" }, { id: "two" }],
  });
  flatStore.move("one", { anchor: true });
  flatStore.move("two", { extend: true });

  const gridStore = createSelectableStore({
    items: [
      { id: "row-1" },
      { id: "cell-1", rowId: "row-1" },
      { id: "row-2" },
      { id: "cell-2", rowId: "row-2" },
    ],
    selectableIds: ["row-1", "row-2"],
  });
  gridStore.move("cell-1", { anchor: true });
  gridStore.move("cell-2", { extend: true });

  expect(warn).not.toHaveBeenCalled();
});

test("row selectAll does not leak cell ids in a large grid", () => {
  const rowIds = Array.from(
    { length: 1000 },
    (_, rowIndex) => `row-${rowIndex}`,
  );
  const items = rowIds.flatMap((rowId) => [
    { id: rowId },
    ...Array.from({ length: 5 }, (_, cellIndex) => ({
      id: `${rowId}-cell-${cellIndex}`,
      rowId,
    })),
  ]);
  const store = createSelectableStore({
    items,
    selectableIds: rowIds,
  });

  store.selectAll();
  expect(store.getState().selectedIds).toHaveLength(1000);
  expect(store.getState().selectedIds[0]).toBe("row-0");
  expect(store.getState().selectedIds.at(-1)).toBe("row-999");
  expect(store.isSelected("row-500-cell-2")).toBe(false);
});

test("a virtualized store gives full ranges and selectAll the same order", () => {
  const items = Array.from({ length: 100 }, (_, index) => ({
    id: `item-${index}`,
  }));
  const store = initialize(
    createCompositeSelectableStore({
      defaultItems: items,
      rangeDelegate: {
        getKeysInRange: (fromId, toId) => {
          const fromIndex = Number(fromId.replace("item-", ""));
          const toIndex = Number(toId.replace("item-", ""));
          const startIndex = Math.min(fromIndex, toIndex);
          const endIndex = Math.max(fromIndex, toIndex);
          return items.slice(startIndex, endIndex + 1).map((item) => item.id);
        },
        getOrderedKeys: () => items.map((item) => item.id),
      },
    }),
  );
  store.setState(
    "renderedItems",
    [items[0], items[99]].flatMap((item) => item ?? []),
  );
  for (const item of items) {
    store.unstable_selection.setOptIn(item.id, true);
  }

  store.unstable_selection.activate("item-0", createEvent());
  store.unstable_selection.activate("item-99", createEvent(true));
  const fullRange = store.getState().selectedIds;
  expect(fullRange).toEqual(items.map((item) => item.id));

  store.deselectAll();
  store.selectAll();
  expect(store.getState().selectedIds).toEqual(fullRange);
});

test("registered renderer delegates are authoritative for selectAll", () => {
  const store = createSelectableStore({
    items: [{ id: "one" }, { id: "two" }, { id: "three" }],
    renderedItems: [{ id: "two" }],
  });
  const removeDelegate = store.unstable_selection.addRangeDelegate({
    getKeysInRange: () => null,
    getOrderedKeys: () => ["one", "two", "three"],
  });

  store.selectAll();
  expect(store.getState().selectedIds).toEqual(["one", "two", "three"]);
  removeDelegate();
  store.deselectAll();
  store.selectAll();
  expect(store.getState().selectedIds).toEqual(["two"]);
});

test("mixed composites select only opted-in items", () => {
  const store = createSelectableStore({
    items: [{ id: "option-1" }, { id: "separator" }, { id: "option-2" }],
    selectableIds: ["option-1", "option-2"],
  });

  store.selectAll();
  expect(store.getState().selectedIds).toEqual(["option-1", "option-2"]);
  expect(store.isSelectable("separator")).toBe(false);
});

test("none mode preserves membership across store functions", () => {
  const store = initialize(
    createCompositeSelectableStore({
      defaultItems: [{ id: "one" }, { id: "two" }],
      defaultSelectedIds: ["one"],
      selectableMode: "none",
    }),
  );
  store.setState("renderedItems", store.getState().items);
  store.unstable_selection.setOptIn("one", true);
  store.unstable_selection.setOptIn("two", true);

  store.toggle("one");
  store.select("two");
  store.deselectAll();
  expect(store.getState().selectedIds).toEqual(["one"]);
});
