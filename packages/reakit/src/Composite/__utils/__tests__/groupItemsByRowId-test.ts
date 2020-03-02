import { groupItemsByRowId } from "../groupItemsByRowId";
import { Item } from "../types";

test("with rowId", () => {
  const items: Item[] = [
    { id: "0", ref: { current: null }, rowId: "0" },
    { id: "1", ref: { current: null }, rowId: "0" },
    { id: "2", ref: { current: null }, rowId: "1" },
    { id: "3", ref: { current: null }, rowId: "1" },
    { id: "4", ref: { current: null }, rowId: "2" },
    { id: "5", ref: { current: null }, rowId: "2" }
  ];
  expect(groupItemsByRowId(items)).toEqual([
    [items[0], items[1]],
    [items[2], items[3]],
    [items[4], items[5]]
  ]);
});

test("without rowId", () => {
  const items: Item[] = [
    { id: "0", ref: { current: null } },
    { id: "1", ref: { current: null } },
    { id: "2", ref: { current: null } }
  ];
  expect(groupItemsByRowId(items)).toEqual([[items[0], items[1], items[2]]]);
});
