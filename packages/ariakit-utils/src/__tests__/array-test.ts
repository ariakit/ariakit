import { toArray } from "../array";

test("toArray", () => {
  expect(toArray(undefined)).toEqual([]);
  expect(toArray(null)).toEqual([null]);
  expect(toArray(1)).toEqual([1]);
  expect(toArray("")).toEqual([""]);
  expect(toArray({})).toEqual([{}]);
  expect(toArray([])).toEqual([]);
});
