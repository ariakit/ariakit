import { ReducerWithoutAction, SetStateAction } from "react";
import { AnyObject } from "./types";

/**
 * Compares two objects.
 *
 * @example
 * import { shallowEqual } from "reakit-utils";
 *
 * shallowEqual({ a: "a" }, {}); // false
 * shallowEqual({ a: "a" }, { b: "b" }); // false
 * shallowEqual({ a: "a" }, { a: "a" }); // true
 * shallowEqual({ a: "a" }, { a: "a", b: "b" }); // false
 */
export function shallowEqual(a?: AnyObject, b?: AnyObject) {
  if (a === b) return true;
  if (!a) return false;
  if (!b) return false;
  if (typeof a !== "object") return false;
  if (typeof b !== "object") return false;

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  const { length } = aKeys;

  if (bKeys.length !== length) return false;

  for (const key of aKeys) {
    if (a[key] !== b[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Transforms `arg` into an array if it's not already.
 *
 * @example
 * import { toArray } from "reakit-utils";
 *
 * toArray("a"); // ["a"]
 * toArray(["a"]); // ["a"]
 */
export function toArray<T>(arg: T) {
  type ToArray<T> = T extends any[] ? T : T[];
  if (Array.isArray(arg)) {
    return arg as ToArray<T>;
  }
  return (typeof arg !== "undefined" ? [arg] : []) as ToArray<T>;
}

/**
 * Receives a `setState` argument and calls it with `currentValue` if it's a
 * function. Otherwise return the argument as the new value.
 *
 * @example
 * import { applyState } from "reakit-utils";
 *
 * applyState((value) => value + 1, 1); // 2
 * applyState(2, 1); // 2
 */
export function applyState<T>(argument: SetStateAction<T>, currentValue: T) {
  if (isUpdater(argument)) {
    return argument(currentValue);
  }
  return argument;
}

function isUpdater<T>(
  argument: SetStateAction<T>
): argument is ReducerWithoutAction<T> {
  return typeof argument === "function";
}

/**
 * Checks whether `arg` is an object or not.
 *
 * @returns {boolean}
 */
export function isObject(arg: any): arg is AnyObject {
  return typeof arg === "object" && arg != null;
}

/**
 * Checks whether `arg` is a plain object or not.
 *
 * @returns {boolean}
 */
export function isPlainObject(arg: any): arg is object {
  if (!isObject(arg)) return false;
  const proto = Object.getPrototypeOf(arg);
  if (proto == null) return true;
  return proto.constructor?.toString() === Object.toString();
}

/**
 * Checks whether `arg` is a promise or not.
 *
 * @returns {boolean}
 */
export function isPromise<T>(arg: T | Promise<T>): arg is Promise<T> {
  return Boolean(arg && "then" in arg && arg.then);
}

/**
 * Checks whether `arg` is empty or not.
 *
 * @example
 * import { isEmpty } from "reakit-utils";
 *
 * isEmpty([]); // true
 * isEmpty(["a"]); // false
 * isEmpty({}); // true
 * isEmpty({ a: "a" }); // false
 * isEmpty(); // true
 * isEmpty(null); // true
 * isEmpty(undefined); // true
 * isEmpty(""); // true
 */
export function isEmpty(arg: any): boolean {
  if (Array.isArray(arg)) return !arg.length;
  if (isObject(arg)) return !Object.keys(arg).length;
  if (arg == null) return true;
  if (arg === "") return true;
  return false;
}

/**
 * Checks whether `arg` is an integer or not.
 *
 * @example
 * import { isInteger } from "reakit-utils";
 *
 * isInteger(1); // true
 * isInteger(1.5); // false
 * isInteger("1"); // true
 * isInteger("1.5"); // false
 */
export function isInteger(arg: any): boolean {
  if (typeof arg === "number") {
    return Math.floor(arg) === arg;
  }
  return String(Math.floor(Number(arg))) === arg;
}

/**
 * Immutably removes an index from an array.
 *
 * @example
 * import { removeIndexFromArray } from "reakit-utils";
 *
 * removeIndexFromArray(["a", "b", "c"], 1); // ["a", "c"]
 *
 * @returns {Array} A new array without the item in the passed index.
 */
export function removeIndexFromArray<T extends any[]>(array: T, index: number) {
  if (index === -1) return array;
  return [...array.slice(0, index), ...array.slice(index + 1)] as T;
}

/**
 * Immutably removes an item from an array.
 *
 * @example
 * import { removeItemFromArray } from "reakit-utils";
 *
 * removeItemFromArray(["a", "b", "c"], "b"); // ["a", "c"]
 *
 * // This only works by reference
 * const obj = {};
 * removeItemFromArray([obj], {}); // [obj]
 * removeItemFromArray([obj], obj); // []
 *
 * @returns {Array} A new array without the passed item.
 */
export function removeItemFromArray<A extends any[]>(
  array: A,
  item: A[number]
) {
  const index = array.indexOf(item);
  return removeIndexFromArray(array, index);
}

/**
 * Omits specific keys from an object.
 *
 * @example
 * import { omit } from "reakit-utils";
 *
 * omit({ a: "a", b: "b" }, ["a"]); // { b: "b" }
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
  object: T,
  paths: ReadonlyArray<K> | K[]
): Omit<T, K> {
  const keys = Object.keys(object);
  const result = {} as Omit<T, K>;

  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (paths.indexOf(key as K) === -1) {
      result[key as Exclude<keyof T, K>] = object[key];
    }
  }

  return result;
}

/**
 * Picks specific keys from an object.
 *
 * @example
 * import { pick } from "reakit-utils";
 *
 * pick({ a: "a", b: "b" }, ["a"]); // { a: "a" }
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
  object: T,
  paths: ReadonlyArray<K> | K[]
) {
  const keys = Object.keys(object) as K[];
  const result = {} as { [P in K]: T[P] };

  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (paths.indexOf(key) >= 0) {
      result[key] = object[key];
    }
  }

  return result;
}
