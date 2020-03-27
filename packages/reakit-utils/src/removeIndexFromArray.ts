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
export function removeIndexFromArray<A extends any[]>(array: A, idx: number) {
  if (idx === -1) return array;
  return [...array.slice(0, idx), ...array.slice(idx + 1)] as A;
}
