import { isObject } from "reakit-utils/isObject";

export function filterAllEmpty<T extends Record<any, any> | Array<any>>(
  object: T
): T {
  if (Array.isArray(object)) {
    return object.filter(value => {
      if (isObject(value)) {
        return filterAllEmpty(value);
      }
      return true;
    }) as T;
  }

  const result = {} as T;
  const keys = Object.keys(object);

  for (const key of keys) {
    const k = key as keyof T;
    const value = object[k];
    result[k] = isObject(value) ? filterAllEmpty(value) : object[k];
  }

  return result;
}
