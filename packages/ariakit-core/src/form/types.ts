import type { AnyObject } from "../utils/types.js";

/**
 * An object or primitive value that can be converted to a string.
 */
export type StringLike = { toString: () => string; valueOf: () => string };

/**
 * Maps through an object `T` or array and defines the leaf values to the given
 * type `V`.
 * @template T Object
 * @template V Value
 */
export type DeepMap<T, V> = {
  [K in keyof T]: T[K] extends AnyObject ? DeepMap<T[K], V> : V;
};

/**
 * Similar to `Partial<T>`, but recursively maps through the object and makes
 * nested object properties optional.
 * @template T Object
 */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends AnyObject ? DeepPartial<T[K]> : T[K];
};

/**
 * Maps through the values object `T` and defines all properties into a string
 * like type. That is, a type that is an object that can contain other
 * properties but can also be converted into a string with the path name.
 * @template T Values object
 */
export type Names<T> = {
  [K in keyof T]: T[K] extends Array<infer U>
    ? U extends AnyObject
      ? { [key: number]: Names<U> } & StringLike
      : { [key: number]: U & StringLike } & StringLike
    : T[K] extends AnyObject
    ? Names<T[K]>
    : StringLike;
};
