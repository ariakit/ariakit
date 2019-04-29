import { deepEqual } from "../deepEqual";

test("deepEqual", () => {
  expect(deepEqual(undefined, undefined)).toBe(true);
  expect(deepEqual({}, {})).toBe(true);
  expect(deepEqual({ a: "a" }, { a: "a" })).toBe(true);
  expect(deepEqual({ a: { b: "b" } }, { a: { b: "b" } })).toBe(true);
  expect(
    deepEqual(
      { a: { b: "b" }, c: { d: "d" } },
      { a: { b: "b" }, c: { d: "e" } }
    )
  ).toBe(false);
  expect(deepEqual({ a: { b: { c: "c" } } }, { a: { b: { c: "c" } } })).toBe(
    false
  );
  expect(deepEqual({ a: { b: { c: "c" } } }, { a: { b: { c: "c" } } }, 2)).toBe(
    true
  );
  expect(deepEqual({ a: "a" }, { a: "b" })).toBe(false);
});
