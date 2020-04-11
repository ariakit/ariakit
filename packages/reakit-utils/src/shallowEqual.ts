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
export function shallowEqual(
  objA: Record<any, any>,
  objB: Record<any, any>
): boolean {
  if (objA === objB) return true;

  const aKeys = Object.keys(objA);
  const bKeys = Object.keys(objB);
  const { length } = aKeys;

  if (bKeys.length !== length) return false;

  for (const key of aKeys) {
    if (objA[key] !== objB[key]) {
      return false;
    }
  }

  return true;
}
