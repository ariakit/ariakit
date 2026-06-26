import { expect, test } from "vitest";
import type { CompositeStoreItem } from "./composite-store.ts";
import { createCompositeStore } from "./composite-store.ts";

function createComposite(items: CompositeStoreItem[]) {
  const store = createCompositeStore();
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
