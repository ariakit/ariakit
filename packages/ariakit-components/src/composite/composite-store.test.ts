import { expect, test } from "vitest";
import type { CompositeStoreItem } from "./composite-store.ts";
import { createCompositeStore, groupItemsByRows } from "./composite-store.ts";

function createComposite(items: CompositeStoreItem[]) {
  const store = createCompositeStore({ defaultItems: items });
  store.setState("renderedItems", items);
  return store;
}

test("moves through enabled items in one-dimensional composites", () => {
  const store = createComposite([
    { id: "one" },
    { id: "two", disabled: true },
    { id: "three" },
  ]);

  expect(store.next({ activeId: "one" })).toBe("three");
  expect(store.previous({ activeId: "three" })).toBe("one");
  expect(store.next({ activeId: "three" })).toBeUndefined();
  expect(store.previous({ activeId: "one" })).toBeUndefined();
});

test("finds the last enabled item", () => {
  const store = createComposite([
    { id: "" },
    { id: "two" },
    { id: "three", disabled: true },
  ]);

  expect(store.last()).toBe("two");

  store.setState("renderedItems", [
    { id: "", disabled: true },
    { id: "two", disabled: true },
  ]);
  expect(store.last()).toBeUndefined();

  store.setState("renderedItems", [{ id: "" }]);
  expect(store.last()).toBe("");
});

test("groups item sets around the large-path threshold", () => {
  for (const fillerCount of [41, 42]) {
    const items: CompositeStoreItem[] = [
      { id: "undefined-1" },
      { id: "empty-1", rowId: "" },
      { id: "prototype-1", rowId: "__proto__" },
      { id: "undefined-2" },
      { id: "empty-2", rowId: "" },
      { id: "prototype-2", rowId: "__proto__" },
      ...Array.from({ length: fillerCount }, (_, index) => ({
        id: `filler-${index}`,
        rowId: "filler",
      })),
    ];
    const rows = groupItemsByRows(items);

    expect(rows).toEqual([
      [items[0], items[3]],
      [items[1], items[4]],
      [items[2], items[5]],
      items.slice(6),
    ]);
    expect(rows[0]?.[0]).toBe(items[0]);
    expect(rows[1]?.[0]).toBe(items[1]);
    expect(rows[2]?.[0]).toBe(items[2]);
  }
});

test("groups large interleaved rows", () => {
  const items: CompositeStoreItem[] = Array.from(
    { length: 48 },
    (_, index) => ({
      id: `item-${index}`,
      rowId: `row-${index % 2}`,
    }),
  );

  expect(groupItemsByRows(items)).toEqual([
    items.filter((_, index) => index % 2 === 0),
    items.filter((_, index) => index % 2 === 1),
  ]);
});

test("moves through rendered items with different object identities", () => {
  const registeredItems = [{ id: "one" }, { id: "two" }];
  const renderedItems = registeredItems.map((item) => ({ ...item }));
  const store = createCompositeStore({ defaultItems: registeredItems });
  store.setState("renderedItems", renderedItems);

  expect(store.next({ activeId: "one" })).toBe("two");
  expect(store.previous({ activeId: "two" })).toBe("one");

  store.setState("renderedItems", registeredItems);
  expect(store.next({ activeId: "one", renderedItems })).toBe("two");
  expect(store.previous({ activeId: "two", renderedItems })).toBe("one");
});

test("supports the deprecated skip number overload", () => {
  const store = createComposite([
    { id: "a1", rowId: "a" },
    { id: "a2", rowId: "a" },
    { id: "a3", rowId: "a" },
    { id: "b1", rowId: "b" },
    { id: "b2", rowId: "b" },
    { id: "b3", rowId: "b" },
    { id: "c1", rowId: "c" },
    { id: "c2", rowId: "c" },
    { id: "c3", rowId: "c" },
  ]);

  store.setActiveId("a1");
  expect(store.next(1)).toBe("a3");
  expect(store.down(1)).toBe("c1");

  store.setActiveId("a3");
  expect(store.previous(1)).toBe("a1");

  store.setActiveId("c1");
  expect(store.up(1)).toBe("a1");
});

test("loops through items and the base element", () => {
  const store = createComposite([{ id: "one" }, { id: "two" }]);

  expect(store.next({ activeId: "two", focusLoop: true })).toBe("one");
  expect(store.previous({ activeId: "one", focusLoop: true })).toBe("two");
  expect(
    store.next({
      activeId: "two",
      focusLoop: true,
      includesBaseElement: true,
    }),
  ).toBeNull();
  expect(store.next({ activeId: null })).toBe("one");
});

test("inverts horizontal navigation in RTL", () => {
  const store = createComposite([{ id: "one" }, { id: "two" }]);

  expect(store.next({ activeId: "two", rtl: true })).toBe("one");
  expect(store.previous({ activeId: "one", rtl: true })).toBe("two");
});

test("wraps across grid rows", () => {
  const store = createComposite([
    { id: "a1", rowId: "a" },
    { id: "a2", rowId: "a" },
    { id: "b1", rowId: "b" },
    { id: "b2", rowId: "b" },
  ]);

  expect(store.next({ activeId: "a2" })).toBeUndefined();
  expect(store.next({ activeId: "a2", focusWrap: true })).toBe("b1");
  expect(store.previous({ activeId: "b1", focusWrap: true })).toBe("a2");
  expect(store.next({ activeId: "b2", focusLoop: true, focusWrap: true })).toBe(
    "a1",
  );
});

test("moves vertically in grids and shifts across uneven rows", () => {
  const store = createComposite([
    { id: "a1", rowId: "a" },
    { id: "a2", rowId: "a" },
    { id: "a3", rowId: "a" },
    { id: "b1", rowId: "b" },
  ]);

  expect(store.down({ activeId: "a1" })).toBe("b1");
  expect(store.up({ activeId: "b1" })).toBe("a1");
  expect(store.down({ activeId: "a3" })).toBeUndefined();
  expect(store.down({ activeId: "a3", focusShift: true })).toBe("b1");
});

test("scans within the active item's row on grids", () => {
  const store = createComposite([
    { id: "a1", rowId: "a" },
    { id: "a2", rowId: "a", disabled: true },
    { id: "a3", rowId: "a" },
    { id: "b1", rowId: "b" },
  ]);

  // Skips the disabled item in the same row.
  expect(store.next({ activeId: "a1" })).toBe("a3");
  // Stops at the end of the row without moving into the next row.
  expect(store.next({ activeId: "a3" })).toBeUndefined();
  // Moves backward within the row.
  expect(store.previous({ activeId: "a3" })).toBe("a1");
  // Stops at the start of the row without moving into the previous row.
  expect(store.previous({ activeId: "b1" })).toBeUndefined();
});

test("loops within the active item's row on grids", () => {
  const store = createComposite([
    { id: "a1", rowId: "a" },
    { id: "a2", rowId: "a" },
    { id: "a3", rowId: "a", disabled: true },
    { id: "b1", rowId: "b" },
    { id: "b2", rowId: "b" },
  ]);

  // Forward loop skips the disabled item and wraps to the first item in the
  // same row, not the next row.
  expect(store.next({ activeId: "a2", focusLoop: true })).toBe("a1");
  // Backward loop wraps to the last item in the same row.
  expect(store.previous({ activeId: "b1", focusLoop: true })).toBe("b2");
  // Backward loop also skips the disabled item when wrapping.
  expect(store.previous({ activeId: "a1", focusLoop: true })).toBe("a2");
});

test("loops past disabled items in one-dimensional composites", () => {
  const store = createComposite([
    { id: "one" },
    { id: "two" },
    { id: "three", disabled: true },
  ]);

  // Wraps around to the first enabled item, skipping the disabled last item.
  expect(store.next({ activeId: "two", focusLoop: true })).toBe("one");
  // Wraps backward to the last enabled item.
  expect(store.previous({ activeId: "one", focusLoop: true })).toBe("two");
});

test("moves vertically in one-dimensional composites", () => {
  const store = createComposite([
    { id: "one" },
    { id: "two", disabled: true },
    { id: "three" },
  ]);

  // Skips the disabled item just like horizontal movement.
  expect(store.down({ activeId: "one" })).toBe("three");
  // Vertical loops wrap around just like horizontal ones.
  expect(store.down({ activeId: "three", focusLoop: true })).toBe("one");
  expect(store.up({ activeId: "one", focusLoop: true })).toBe("three");
});

test("handles falsy item ids and row ids", () => {
  // An item with an empty string id must not return itself when looping.
  const single = createComposite([{ id: "" }]);
  expect(single.next({ activeId: "", focusLoop: true })).toBeUndefined();

  const items = createComposite([{ id: "" }, { id: "next" }]);
  expect(items.next({ activeId: "" })).toBe("next");
  expect(items.previous({ activeId: "next" })).toBe("");

  // Empty string row ids behave like undefined row ids when moving
  // vertically.
  const store = createComposite([{ id: "b", rowId: "" }, { id: "a" }]);
  expect(store.down({ activeId: "b" })).toBe("a");
  expect(store.up({ activeId: "a" })).toBe("b");
});
