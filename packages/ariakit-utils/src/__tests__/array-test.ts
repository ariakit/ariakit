import {
  addItemToArray,
  flatten2DArray,
  reverseArray,
  toArray,
} from "../array";

test("toArray", () => {
  expect(toArray(undefined)).toEqual([]);
  expect(toArray(null)).toEqual([null]);
  expect(toArray(1)).toEqual([1]);
  expect(toArray("")).toEqual([""]);
  expect(toArray({})).toEqual([{}]);
  expect(toArray([])).toEqual([]);
});

test("addItemToArray", () => {
  const arr = ["a", "b", "d"];
  expect(addItemToArray(arr, "c", 2)).toEqual(["a", "b", "c", "d"]);
  // Empty Array
  expect(addItemToArray([] as string[], "c", 2)).toEqual(["c"]);
  // No Index
  expect(addItemToArray(arr, "c")).toEqual(["a", "b", "d", "c"]);
  // Index > length
  expect(addItemToArray(arr, "c", 99)).toEqual(["a", "b", "d", "c"]);
  // Immunitibility
  expect(addItemToArray(arr, "c", 2)).not.toEqual(arr);
});

test("flatten2DArray", () => {
  const arr = [["a"], ["b"], ["d"]];
  expect(flatten2DArray(arr)).toEqual(["a", "b", "d"]);
  // Empty Array
  expect(flatten2DArray([])).toEqual([]);
  // Immunitibility
  expect(flatten2DArray(arr)).not.toEqual(arr);
});

test("reverseArray", () => {
  const arr = ["a", "b", "d"];
  expect(reverseArray(arr)).toEqual(["d", "b", "a"]);
  // Empty Array
  expect(reverseArray([])).toEqual([]);
  // Immunitibility
  expect(reverseArray(arr)).not.toEqual(arr);
});
