/**
 * Transforms `arg` into an array if it's not already.
 * @example
 * toArray("a"); // ["a"]
 * toArray(["a"]); // ["a"]
 */
export function toArray<T>(arg: T) {
  type ToArray<T> = T extends readonly any[] ? T : T[];
  if (Array.isArray(arg)) {
    return arg as ToArray<T>;
  }
  return (typeof arg !== "undefined" ? [arg] : []) as ToArray<T>;
}

/**
 * Immutably adds an index to an array.
 * @example
 * addItemToArray(["a", "b", "d"], "c", 2); // ["a", "b", "c", "d"]
 */
export function addItemToArray<T extends any[]>(
  array: T,
  item: T[number],
  index = -1,
) {
  if (!(index in array)) {
    return [...array, item] as T;
  }
  return [...array.slice(0, index), item, ...array.slice(index)] as T;
}

/**
 * Flattens a 2D array into a one-dimensional array.
 * @example
 * flatten2DArray([["a"], ["b"], ["c"]]); // ["a", "b", "c"]
 */
export function flatten2DArray<T>(array: T[][]) {
  const flattened: T[] = [];
  for (const row of array) {
    flattened.push(...row);
  }
  return flattened;
}

/**
 * Immutably reverses an array.
 * @example
 * reverseArray(["a", "b", "c"]); // ["c", "b", "a"]
 */
export function reverseArray<T>(array: T[]): T[] {
  return array.slice().reverse();
}
