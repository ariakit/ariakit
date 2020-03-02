import { verticalizeItems } from "../verticalizeItems";
import { Item } from "../types";

test("verticalizeItems", () => {
  const items: Item[] = [
    { id: "0", ref: { current: null }, rowId: "0" },
    { id: "1", ref: { current: null }, rowId: "0" },
    { id: "2", ref: { current: null }, rowId: "1" },
    { id: "3", ref: { current: null }, rowId: "1" },
    { id: "4", ref: { current: null }, rowId: "2" },
    { id: "5", ref: { current: null }, rowId: "2" }
  ];
  expect(verticalizeItems(items)).toEqual([
    { ...items[0], rowId: "0" },
    { ...items[2], rowId: "0" },
    { ...items[4], rowId: "0" },
    { ...items[1], rowId: "1" },
    { ...items[3], rowId: "1" },
    { ...items[5], rowId: "1" }
  ]);
});
