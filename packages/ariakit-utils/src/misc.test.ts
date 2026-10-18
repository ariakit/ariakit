import { expect, test, vi } from "vitest";
import {
  applyState,
  defaultValue,
  isEmpty,
  isInteger,
  removeUndefinedValues,
  shallowEqual,
  warnOnce,
} from "./misc.ts";

/**
 * Defines an enumerable property on `Object.prototype`, the way prototype
 * pollution does, and removes it again on disposal. Lets a test prove that an
 * inherited key never becomes an own property of the result.
 */
function polluteObjectPrototype(key: string, value: unknown) {
  // oxlint-disable-next-line no-extend-native
  Object.defineProperty(Object.prototype, key, {
    value,
    configurable: true,
    enumerable: true,
    writable: true,
  });
  return {
    [Symbol.dispose]() {
      Reflect.deleteProperty(Object.prototype, key);
    },
  };
}

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

test("shallowEqual compares keys with undefined values", () => {
  const email = { email: undefined };
  const phone = { phone: undefined };
  expect(shallowEqual(email, phone)).toBe(false);
  expect(shallowEqual(phone, email)).toBe(false);
  expect(shallowEqual({ email: undefined }, { email: undefined })).toBe(true);
});

test("shallowEqual ignores inherited and non-enumerable keys", () => {
  const inherited = Object.create({ email: undefined });
  inherited.phone = undefined;
  const own = { email: undefined, phone: undefined };
  expect(shallowEqual(own, inherited)).toBe(false);
  expect(shallowEqual(inherited, own)).toBe(false);

  // Same enumerable key count as { email: undefined }, but the matching key is
  // hidden.
  const hidden = { phone: undefined };
  Object.defineProperty(hidden, "email", { value: undefined });
  expect(shallowEqual({ email: undefined }, hidden)).toBe(false);
  expect(shallowEqual(hidden, { email: undefined })).toBe(false);

  const nullPrototype = Object.assign(Object.create(null), {
    email: undefined,
  });
  expect(shallowEqual(nullPrototype, { email: undefined })).toBe(true);
  expect(shallowEqual({ email: undefined }, nullPrototype)).toBe(true);
  expect(shallowEqual(nullPrototype, { phone: undefined })).toBe(false);

  const shadowed = { hasOwnProperty: () => true, phone: undefined };
  const other = { hasOwnProperty: shadowed.hasOwnProperty, email: undefined };
  expect(shallowEqual(shadowed, other)).toBe(false);
  expect(shallowEqual(other, shadowed)).toBe(false);
});

test("shallowEqual keeps strict value comparison", () => {
  const nested = { value: 1 };
  const object = { a: 1 };
  expect(shallowEqual(object, object)).toBe(true);
  expect(shallowEqual({ a: Number.NaN }, { a: Number.NaN })).toBe(false);
  expect(shallowEqual({ a: -0 }, { a: 0 })).toBe(true);
  expect(shallowEqual({ a: nested }, { a: nested })).toBe(true);
  expect(shallowEqual({ a: { value: 1 } }, { a: { value: 1 } })).toBe(false);
});

test("removeUndefinedValues drops only the undefined values", () => {
  const result = removeUndefinedValues({
    a: 1,
    b: undefined,
    c: null,
    d: false,
  });
  // `toEqual` ignores keys holding `undefined`, so the dropped key has to be
  // asserted through the resulting key list.
  expect(Object.keys(result)).toEqual(["a", "c", "d"]);
  expect(result).toEqual({ a: 1, c: null, d: false });
});

test("removeUndefinedValues copies own properties only", () => {
  using _pollution = polluteObjectPrototype("aria-hidden", "true");
  const result = removeUndefinedValues({ id: "button" });
  expect(Object.keys(result)).toEqual(["id"]);
  expect(Object.hasOwn(result, "aria-hidden")).toBe(false);
});

test("removeUndefinedValues drops a __proto__ key", () => {
  // An own enumerable `__proto__` is what `JSON.parse` produces, and assigning
  // it would run the `Object.prototype` setter and swap the result's prototype
  // instead of adding a property.
  const payload = JSON.parse('{"__proto__":{"id":"injected"},"name":"real"}');
  // Pin the fixture: an object literal would set the prototype instead of
  // creating the own key this test needs to exercise.
  expect(Object.hasOwn(payload, "__proto__")).toBe(true);
  const result = removeUndefinedValues(payload);
  expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
  expect(result.id).toBeUndefined();
  expect(Object.keys(result)).toEqual(["name"]);
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
