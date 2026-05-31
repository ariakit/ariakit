import { expect, test } from "vitest";
import { addItemToArray, toArray } from "./array.ts";

test("toArray keeps arrays and wraps defined values", () => {
  const array = ["a", "b"];

  expect(toArray(array)).toBe(array);
  expect(toArray("a")).toEqual(["a"]);
  expect(toArray(undefined)).toEqual([]);
});

test("addItemToArray inserts by index or appends for missing indexes", () => {
  expect(addItemToArray(["a", "c"], "b", 1)).toEqual(["a", "b", "c"]);
  expect(addItemToArray(["a", "b"], "c", -1)).toEqual(["a", "b", "c"]);
  expect(addItemToArray(["a", "b"], "c", 10)).toEqual(["a", "b", "c"]);
});
