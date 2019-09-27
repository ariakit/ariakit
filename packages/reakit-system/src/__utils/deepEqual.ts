import { isObject } from "reakit-utils/isObject";

export function deepEqual(
  objA?: Record<any, any>,
  objB?: Record<any, any>,
  depth = 1
): boolean {
  if (objA === objB) return true;
  if (!objA || !objB) return false;

  const aKeys = Object.keys(objA);
  const bKeys = Object.keys(objB);
  const { length } = aKeys;

  if (bKeys.length !== length) return false;

  for (const key of aKeys) {
    if (objA[key] !== objB[key]) {
      if (
        !depth ||
        !isObject(objA[key]) ||
        !isObject(objB[key]) ||
        !deepEqual(objA[key], objB[key], depth - 1)
      ) {
        return false;
      }
    }
  }

  return true;
}
