import { verticalizeItems } from "../verticalizeItems";
import { Item } from "../types";

test("verticalizeItems", () => {
  const items: Item[] = [
    { id: "0", ref: { current: null }, groupId: "0" },
    { id: "1", ref: { current: null }, groupId: "0" },
    { id: "2", ref: { current: null }, groupId: "1" },
    { id: "3", ref: { current: null }, groupId: "1" },
    { id: "4", ref: { current: null }, groupId: "2" },
    { id: "5", ref: { current: null }, groupId: "2" }
  ];
  expect(verticalizeItems(items)).toEqual([
    { ...items[0], groupId: "0" },
    { ...items[2], groupId: "0" },
    { ...items[4], groupId: "0" },
    { ...items[1], groupId: "1" },
    { ...items[3], groupId: "1" },
    { ...items[5], groupId: "1" }
  ]);
});
