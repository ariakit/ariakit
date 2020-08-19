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
