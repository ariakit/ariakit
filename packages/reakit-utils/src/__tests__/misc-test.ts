import {
  applyState,
  isEmpty,
  isInteger,
  isObject,
  isPlainObject,
  isPromise,
  omit,
  pick,
  removeIndexFromArray,
  removeItemFromArray,
  shallowEqual,
  toArray,
} from "../misc";

test("applyState", () => {
  expect(applyState((value) => value + 1, 1)).toBe(2);
  expect(applyState(2, 1)).toBe(2);
});

test("isEmpty", () => {
  expect(isEmpty([])).toBe(true);
  expect(isEmpty({})).toBe(true);
  expect(isEmpty(null)).toBe(true);
  expect(isEmpty("")).toBe(true);
  expect(isEmpty(0)).toBe(false);
  expect(isEmpty("a")).toBe(false);
  expect(isEmpty(["a"])).toBe(false);
  expect(isEmpty({ a: "a" })).toBe(false);
});

test("isInteger", () => {
  expect(isInteger(1)).toBe(true);
  expect(isInteger("1")).toBe(true);
  expect(isInteger(1.5)).toBe(false);
  expect(isInteger("1.5")).toBe(false);
});

test("isObject", () => {
  expect(isObject({})).toBe(true);
  expect(isObject([])).toBe(true);
  expect(isObject(1)).toBe(false);
  expect(isObject("a")).toBe(false);
  expect(isObject(null)).toBe(false);
});

test("isPlainObject", () => {
  class Obj {}
  expect(isPlainObject({})).toBe(true);
  expect(isPlainObject(new Obj())).toBe(false);
  expect(isPlainObject([])).toBe(false);
  expect(isPlainObject(1)).toBe(false);
  expect(isPlainObject("a")).toBe(false);
  expect(isPlainObject(null)).toBe(false);
});

test("isPromise", () => {
  expect(isPromise(new Promise(() => {}))).toBe(true);
  expect(isPromise({})).toBe(false);
});

test("omit", () => {
  expect(omit({ a: "a", b: "b", c: "c" }, ["a", "b"])).toEqual({ c: "c" });
});

test("pick", () => {
  expect(pick({ a: "a", b: "b", c: "c" }, ["a", "b"])).toEqual({
    a: "a",
    b: "b",
  });
});

test("removeIndexFromArray", () => {
  expect(removeIndexFromArray(["a", "b", "c"], 1)).toEqual(["a", "c"]);
  expect(removeIndexFromArray(["a", "b", "c"], 3)).toEqual(["a", "b", "c"]);
  expect(removeIndexFromArray(["a", "b", "c"], -1)).toEqual(["a", "b", "c"]);
});

test("removeItemFromArray", () => {
  const obj = {};
  expect(removeItemFromArray([1, 2, 3], 2)).toEqual([1, 3]);
  expect(removeItemFromArray([1, obj, 3], obj)).toEqual([1, 3]);
});

test("shallowEqual", () => {
  expect(shallowEqual({}, {})).toBe(true);
  expect(shallowEqual({ a: "a" }, { b: "b" })).toBe(false);
  expect(shallowEqual({ a: "a" }, { a: "a" })).toBe(true);
  expect(shallowEqual({ a: "a" }, { a: "a", b: "b" })).toBe(false);
  expect(shallowEqual({ a: "a" }, {})).toBe(false);
});

test("toArray", () => {
  expect(toArray([1])).toEqual([1]);
  expect(toArray(1)).toEqual([1]);
});
