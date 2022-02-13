import { MutableRefObject, ReducerWithoutAction, RefCallback } from "react";
import { AnyFunction, AnyObject, SetStateAction } from "./types";

/**
 * Empty function.
 */
export function noop(..._: any[]): any {}

/**
 * Compares two objects.
 * @example
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
 * Receives a `setState` argument and calls it with `currentValue` if it's a
 * function. Otherwise return the argument as the new value.
 * @example
 * applyState((value) => value + 1, 1); // 2
 * applyState(2, 1); // 2
 */
export function applyState<T>(
  argument: SetStateAction<T>,
  currentValue: T | (() => T)
) {
  if (isUpdater(argument)) {
    const value = isLazyValue(currentValue) ? currentValue() : currentValue;
    return argument(value);
  }
  return argument;
}

function isUpdater<T>(
  argument: SetStateAction<T>
): argument is ReducerWithoutAction<T> {
  return typeof argument === "function";
}

function isLazyValue<T>(value: any): value is () => T {
  return typeof value === "function";
}

/**
 * Sets both a function and object React ref.
 */
export function setRef<T>(
  ref: RefCallback<T> | MutableRefObject<T> | null | undefined,
  value: T
) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
}

/**
 * Checks whether `arg` is an object or not.
 * @returns {boolean}
 */
export function isObject(arg: any): arg is Record<any, unknown> {
  return typeof arg === "object" && arg != null;
}

/**
 * Checks whether `arg` is empty or not.
 * @example
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
 * Checks whether `arg` is a promise or not.
 * @returns {boolean}
 */
export function isPromise<T>(arg: T | Promise<T>): arg is Promise<T> {
  return Boolean(arg && "then" in arg && typeof arg.then === "function");
}

/**
 * Checks whether `arg` is an integer or not.
 * @example
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
 * Checks whether `prop` is an own property of `obj` or not.
 */
export function hasOwnProperty<T extends AnyObject>(
  object: T,
  prop: keyof any
): prop is keyof T {
  return Object.prototype.hasOwnProperty.call(object, prop);
}

/**
 * Receives functions as arguments and returns a new function that calls all.
 */
export function chain<T>(...fns: T[]) {
  return (...args: T extends AnyFunction ? Parameters<T> : never) => {
    for (const fn of fns) {
      if (typeof fn === "function") {
        // @ts-ignore
        fn(...args);
      }
    }
  };
}

/**
 * Returns a string with the truthy values of `args` separated by space.
 */
export function cx(...args: Array<string | null | false | undefined>) {
  return args.filter(Boolean).join(" ") || undefined;
}

/**
 * Removes diatrics from a string.
 * TODO: Check if it works on WebView Android.
 */
export function normalizeString(str: string) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Queues a function to be called at the end of the current event loop.
 */
export function queueMicrotask(callback: VoidFunction) {
  if (window.queueMicrotask) {
    return window.queueMicrotask(callback);
  }
  Promise.resolve().then(callback);
}
