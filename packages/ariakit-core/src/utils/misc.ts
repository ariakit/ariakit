import type {
  AnyFunction,
  AnyObject,
  BivariantCallback,
  SetStateAction,
} from "./types.js";

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
  currentValue: T | (() => T),
) {
  if (isUpdater(argument)) {
    const value = isLazyValue(currentValue) ? currentValue() : currentValue;
    return argument(value);
  }
  return argument;
}

function isUpdater<T>(
  argument: SetStateAction<T>,
): argument is BivariantCallback<(prevState: T) => T> {
  return typeof argument === "function";
}

function isLazyValue<T>(value: any): value is () => T {
  return typeof value === "function";
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
  prop: keyof any,
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
export function cx(...args: Array<string | null | false | 0 | undefined>) {
  return args.filter(Boolean).join(" ") || undefined;
}

/**
 * Removes diatrics from a string.
 */
export function normalizeString(str: string) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Omits specific keys from an object.
 * @example
 * omit({ a: "a", b: "b" }, ["a"]); // { b: "b" }
 */
export function omit<T extends AnyObject, K extends keyof T>(
  object: T,
  keys: ReadonlyArray<K> | K[],
) {
  const result = { ...object } as Omit<T, K>;
  for (const key of keys) {
    if (hasOwnProperty(result, key)) {
      delete result[key];
    }
  }
  return result;
}

/**
 * Picks specific keys from an object.
 * @example
 * pick({ a: "a", b: "b" }, ["a"]); // { a: "a" }
 */
export function pick<T extends AnyObject, K extends keyof T>(
  object: T,
  paths: ReadonlyArray<K> | K[],
) {
  const result = {} as Pick<T, K>;
  for (const key of paths) {
    if (hasOwnProperty(object, key)) {
      result[key] = object[key];
    }
  }
  return result;
}

/**
 * Returns the same argument.
 */
export function identity<T>(value: T) {
  return value;
}

/**
 * Runs right before the next paint.
 */
export function beforePaint(cb: () => void = noop) {
  const raf = requestAnimationFrame(cb);
  return () => cancelAnimationFrame(raf);
}

/**
 * Runs after the next paint.
 */
export function afterPaint(cb: () => void = noop) {
  let raf = requestAnimationFrame(() => {
    raf = requestAnimationFrame(cb);
  });
  return () => cancelAnimationFrame(raf);
}

/**
 * Asserts that a condition is true, otherwise throws an error.
 * @example
 * invariant(
 *   condition,
 *   process.env.NODE_ENV !== "production" && "Invariant failed"
 * );
 */
export function invariant(
  condition: any,
  message?: string | boolean,
): asserts condition {
  if (condition) return;
  if (typeof message !== "string") throw new Error("Invariant failed");
  throw new Error(message);
}

/**
 * Similar to `Object.keys` but returns a type-safe array of keys.
 */
export function getKeys<T extends object>(obj: T) {
  return Object.keys(obj) as Array<keyof T>;
}

/**
 * Checks whether a boolean event prop (e.g., hideOnInteractOutside) was
 * intentionally set to false, either with a boolean value or a callback that
 * returns false.
 */
export function isFalsyBooleanCallback<T extends unknown[]>(
  booleanOrCallback?: boolean | ((...args: T) => boolean),
  ...args: T
) {
  const result =
    typeof booleanOrCallback === "function"
      ? booleanOrCallback(...args)
      : booleanOrCallback;
  if (result == null) return false;
  return !result;
}

/**
 * Checks whether something is disabled or not based on its props.
 */
export function disabledFromProps(props: {
  disabled?: boolean;
  "aria-disabled"?: boolean | "true" | "false";
}) {
  return (
    props.disabled ||
    props["aria-disabled"] === true ||
    props["aria-disabled"] === "true"
  );
}

/**
 * Returns the first value that is not `undefined`.
 */
export function defaultValue<T extends readonly any[]>(...values: T) {
  for (const value of values) {
    if (value !== undefined) return value as DefaultValue<T>;
  }
  return undefined as DefaultValue<T>;
}

type DefinedArray<T extends readonly any[]> = {
  [K in keyof T as undefined extends T[K] ? never : K]: undefined extends T[K]
    ? [Exclude<T[K], undefined>, never]
    : [T[K]];
};

type DefaultValue<T extends readonly any[]> =
  DefinedArray<T>[keyof DefinedArray<T>] extends [any, never]
    ? T[number]
    : DefinedArray<T>[keyof DefinedArray<T>][0];
