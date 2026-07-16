import { expect, test, vi } from "vitest";
import {
  applyState,
  defaultValue,
  isEmpty,
  isInteger,
  shallowEqual,
  warnOnce,
} from "./misc.ts";

test("isInteger preserves its loose numeric coercion behavior", () => {
  expect(isInteger(0)).toBe(true);
  expect(isInteger(1)).toBe(true);
  expect(isInteger(-1)).toBe(true);
  expect(isInteger(1.5)).toBe(false);
  expect(isInteger(Number.NaN)).toBe(false);
  expect(isInteger(Infinity)).toBe(true);

  expect(isInteger("0")).toBe(true);
  expect(isInteger("1")).toBe(true);
  expect(isInteger("-1")).toBe(true);
  expect(isInteger("01")).toBe(false);
  expect(isInteger("")).toBe(false);
  expect(isInteger("1.5")).toBe(false);
  expect(isInteger("name")).toBe(false);
  expect(isInteger("NaN")).toBe(true);
  expect(isInteger("Infinity")).toBe(true);
});

test("isEmpty handles nullish, collection, and primitive values", () => {
  expect(isEmpty(null)).toBe(true);
  expect(isEmpty(undefined)).toBe(true);
  expect(isEmpty("")).toBe(true);
  expect(isEmpty([])).toBe(true);
  expect(isEmpty({})).toBe(true);

  expect(isEmpty(" ")).toBe(false);
  expect(isEmpty([0])).toBe(false);
  expect(isEmpty({ value: undefined })).toBe(false);
});

test("applyState evaluates updater functions against eager or lazy values", () => {
  expect(applyState("next", "current")).toBe("next");
  expect(applyState((value: number) => value + 1, 1)).toBe(2);
  expect(
    applyState(
      (value: number) => value + 1,
      () => 1,
    ),
  ).toBe(2);
});

test("shallowEqual compares own enumerable values", () => {
  expect(shallowEqual({ a: 1 }, { a: 1 })).toBe(true);
  expect(shallowEqual({ a: 1 }, { a: 2 })).toBe(false);
  expect(shallowEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  expect(shallowEqual(undefined, { a: 1 })).toBe(false);
});

test("defaultValue returns the first defined value", () => {
  expect(defaultValue(undefined, null, "fallback")).toBeNull();
  expect(defaultValue(undefined, false, true)).toBe(false);
  expect(defaultValue(undefined, 0, 1)).toBe(0);
  expect(defaultValue(undefined, undefined)).toBeUndefined();
});

test("warnOnce logs each warning once", () => {
  using consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
  warnOnce("First warning");
  warnOnce("First warning");
  warnOnce("Second warning");
  expect(consoleWarn.mock.calls).toEqual([
    ["First warning"],
    ["Second warning"],
  ]);
});

test("warnOnce distinguishes keys", () => {
  using consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const firstKey = {};
  const secondKey = {};
  warnOnce("Scoped warning", firstKey);
  warnOnce("Scoped warning", firstKey);
  warnOnce("Scoped warning", secondKey);
  expect(consoleWarn).toHaveBeenCalledTimes(2);
});
