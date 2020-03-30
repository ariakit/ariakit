/**
 * Transforms an array with multiple levels into a flattened one.
 *
 * @example
 * import { flatten } from "reakit-utils";
 *
 * flatten([0, 1, [2, [3, 4], 5], 6]);
 * // => [0, 1, 2, 3, 4, 5, 6]
 */
export function flatten<T>(array: T[]) {
  const flattened = [] as T[];
  for (const possibleArray of array) {
    if (Array.isArray(possibleArray)) {
      flattened.push(...flatten(possibleArray));
    } else {
      flattened.push(possibleArray);
    }
  }
  return flattened;
}
