import { sleep } from "ariakit-test-utils";
import {
  applyState,
  chain,
  cx,
  hasOwnProperty,
  isEmpty,
  isInteger,
  isObject,
  isPromise,
  normalizeString,
  queueMicrotask,
  setRef,
  shallowEqual,
} from "../misc";

test("shallowEqual", () => {
  expect(shallowEqual(undefined, undefined)).toBe(true);
  expect(shallowEqual(undefined, {})).toBe(false);
  expect(shallowEqual({}, undefined)).toBe(false);
  // @ts-expect-error
  expect(shallowEqual("notAnObject", {})).toBe(false);
  // @ts-expect-error
  expect(shallowEqual({}, "notAnObject")).toBe(false);
  expect(shallowEqual({ a: "a" }, {})).toBe(false);
  expect(shallowEqual({ a: "a" }, { b: "b" })).toBe(false);
  expect(shallowEqual({ a: "a" }, { a: "a" })).toBe(true);
  expect(shallowEqual({ a: "a" }, { a: "a", b: "b" })).toBe(false);
});

test("applyState", () => {
  expect(applyState((value) => value + 1, 1)).toBe(2);
  expect(
    applyState(
      (value) => value + 1,
      () => 1
    )
  ).toBe(2);
  expect(applyState(2, 1)).toBe(2);
});

test("setRef", () => {
  const ref = { current: null };
  setRef(ref, "value");
  expect(ref.current).toBe("value");

  const ref2 = (val: any) => (ref.current = val);
  setRef(ref2, "value2");
  expect(ref.current).toBe("value2");

  const ref3 = null;
  setRef(ref3, "value3");
  expect(ref3).toBe(null);
});

test("isObject", () => {
  expect(isObject(undefined)).toBe(false);
  expect(isObject(null)).toBe(false);
  expect(isObject("notAnObject")).toBe(false);
  expect(isObject({})).toBe(true);
  expect(isObject([])).toBe(true);
  expect(isObject(() => {})).toBe(false);
  expect(isObject(Symbol("symbol"))).toBe(false);
  expect(isObject(1)).toBe(false);
  expect(isObject(true)).toBe(false);
  expect(isObject(false)).toBe(false);
});

test("isEmpty", () => {
  expect(isEmpty(undefined)).toBe(true);
  expect(isEmpty(null)).toBe(true);
  expect(isEmpty("")).toBe(true);
  expect(isEmpty({})).toBe(true);
  expect(isEmpty({ a: "a" })).toBe(false);
  expect(isEmpty([])).toBe(true);
  expect(isEmpty([1])).toBe(false);
  expect(isEmpty(() => {})).toBe(false);
  expect(isEmpty(Symbol("symbol"))).toBe(false);
  expect(isEmpty(1)).toBe(false);
  expect(isEmpty(true)).toBe(false);
  expect(isEmpty(false)).toBe(false);
});

test("isPromise", () => {
  expect(isPromise({})).toBe(false);
  expect(isPromise([])).toBe(false);
  expect(isPromise(() => {})).toBe(false);
  expect(isPromise(Promise.resolve())).toBe(true);
});

test("isInteger", () => {
  expect(isInteger(0)).toBe(true);
  expect(isInteger(1)).toBe(true);
  expect(isInteger(1.1)).toBe(false);
  expect(isInteger("1")).toBe(true);
  expect(isInteger("1.1")).toBe(false);
  expect(isInteger(true)).toBe(false);
  expect(isInteger(false)).toBe(false);
  expect(isInteger(undefined)).toBe(false);
  expect(isInteger(null)).toBe(false);
});

test("hasOwnProperty", () => {
  expect(hasOwnProperty({}, "a")).toBe(false);
  expect(hasOwnProperty({ a: "a" }, "a")).toBe(true);
  expect(hasOwnProperty({ a: "a" }, "b")).toBe(false);
});

test("chain", () => {
  let value = 0;
  chain(
    () => {
      value = 1;
    },
    () => {
      value = 2;
    }
  )();
  expect(value).toBe(2);

  value = 0;
  chain(
    () => {
      value = 1;
    },
    // @ts-expect-error
    "Not a function",
    () => {
      value = 2;
    }
  )();
  expect(value).toBe(2);
});

test("cx", () => {
  expect(cx()).toBe(undefined);
  expect(cx("a")).toBe("a");
  expect(cx(null)).toBe(undefined);
  expect(cx(false)).toBe(undefined);
  expect(cx(undefined)).toBe(undefined);
  expect(cx("a", "b")).toBe("a b");
  expect(cx("a", null, "c")).toBe("a c");
  expect(cx("a", false, "c")).toBe("a c");
  expect(cx("a", undefined, "c")).toBe("a c");
});

test("normalizeString", () => {
  expect(normalizeString("a")).toBe("a");
  expect(normalizeString("a b")).toBe("a b");
  expect(normalizeString("\u0041\u006d\u00e9\u006c\u0069\u0065")).toBe(
    "Amelie"
  );
  expect(normalizeString("\u0041\u006d\u0065\u0301\u006c\u0069\u0065")).toBe(
    "Amelie"
  );
});

test("queueMicrotask", async () => {
  let value = 0;
  queueMicrotask(() => {
    value = 1;
  });
  expect(value).toBe(0);
  await sleep();
  expect(value).toBe(1);

  // test when window doesn't have queueMicrotask
  const originalQueueMicrotask =
    Object.getOwnPropertyDescriptor(window, "queueMicrotask") ?? {};
  Object.defineProperty(window, "queueMicrotask", {
    value: undefined,
    configurable: true,
  });

  value = 0;
  queueMicrotask(() => {
    value = 2;
  });
  expect(value).toBe(0);
  await sleep();
  expect(value).toBe(2);

  Object.defineProperty(window, "queueMicrotask", originalQueueMicrotask);
});
