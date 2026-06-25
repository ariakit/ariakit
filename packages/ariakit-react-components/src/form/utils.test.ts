import { expect, test } from "vitest";
import { getArrayFieldIndex, isArrayFieldName } from "./utils.ts";

test.each([
  ["tags", "tags", true],
  ["tags.0", "tags", true],
  ["tags.0.name", "tags", true],
  ["tags2", "tags", false],
  ["tags2.0", "tags", false],
  ["c++.0", "c++", true],
  ["a(b.0", "a(b", true],
] as const)(
  "isArrayFieldName(%s, %s) returns %s",
  (fieldName, name, expected) => {
    expect(isArrayFieldName(fieldName, name)).toBe(expected);
  },
);

test.each([
  ["tags.0", "tags", 0],
  ["tags.10.name", "tags", 10],
  ["c++.1", "c++", 1],
  ["a(b.2", "a(b", 2],
] as const)(
  "getArrayFieldIndex(%s, %s) returns %i",
  (fieldName, name, expected) => {
    expect(getArrayFieldIndex(fieldName, name)).toBe(expected);
  },
);

test.each([
  ["tags", "tags"],
  ["tags.x", "tags"],
  ["tags2.0", "tags"],
] as const)("getArrayFieldIndex(%s, %s) returns NaN", (fieldName, name) => {
  expect(getArrayFieldIndex(fieldName, name)).toBeNaN();
});
