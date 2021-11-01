import { createStoreContext } from "ariakit-utils/store";
import { isInteger, isObject } from "ariakit-utils/misc";
import { AnyObject } from "ariakit-utils/types";
import { FormState } from "./form-state";

export const FormContext = createStoreContext<FormState>();

export function hasMessages(object: AnyObject): boolean {
  return Object.keys(object).some((key) => {
    if (isObject(object[key])) {
      return hasMessages(object[key]);
    }
    return !!object[key];
  });
}

export function get<T>(
  values: AnyObject,
  path: StringLike | string[],
  defaultValue?: T
): T {
  const [key, ...rest] = Array.isArray(path) ? path : `${path}`.split(".");
  if (key == null || !values) {
    return defaultValue as T;
  }
  if (!rest.length) {
    return values[key] ?? defaultValue;
  }
  return get(values[key], rest, defaultValue);
}

export function set<T extends AnyObject | unknown[]>(
  values: T,
  path: StringLike | string[],
  value: unknown
): T {
  const [k, ...rest] = Array.isArray(path) ? path : `${path}`.split(".");
  if (k == null) return values;
  const key = k as keyof T;
  const isIntegerKey = isInteger(key);
  const nextValues = isIntegerKey ? values || [] : values || {};
  const result = rest.length ? set(nextValues[key], rest, value) : value;
  if (isIntegerKey) {
    if (values) {
      const index = Number(key);
      return [
        ...values.slice(0, index),
        result,
        ...values.slice(index + 1),
      ] as T;
    }
    return [result] as T;
  }
  return { ...values, [key]: result };
}

export function setAll<T extends AnyObject, V>(values: T, value: V) {
  const result = {} as AnyObject;
  const keys = Object.keys(values);
  for (const key of keys) {
    const currentValue = values[key];
    if (Array.isArray(currentValue)) {
      result[key] = currentValue.map((v) => {
        if (isObject(v)) {
          return setAll(v, value);
        }
        return value;
      });
    } else if (isObject(currentValue)) {
      result[key] = setAll(currentValue, value);
    } else {
      result[key] = value;
    }
  }
  return result as DeepMap<T, V>;
}

export function createNames() {
  const cache = Object.create(null);
  return new Proxy(Object.create(null), getNameHandler(cache));
}

function getNameHandler(
  cache: AnyObject,
  prevKeys: Array<string | symbol> = []
) {
  const handler: ProxyHandler<AnyObject> = {
    get(target, key) {
      if (["toString", "valueOf", Symbol.toPrimitive].includes(key)) {
        return () => prevKeys.join(".");
      }
      const nextKeys = [...prevKeys, key];
      const nextKey = nextKeys.join(".");
      if (cache[nextKey]) {
        return cache[nextKey];
      }
      const nextProxy = new Proxy(target, getNameHandler(cache, nextKeys));
      cache[nextKey] = nextProxy;
      return nextProxy;
    },
  };
  return handler;
}

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
