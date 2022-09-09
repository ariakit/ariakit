/**
 * Transforms `arg` into an array if it's not already.
 * @example
 * toArray("a"); // ["a"]
 * toArray(["a"]); // ["a"]
 */
export declare function toArray<T>(arg: T): T extends any[] ? T : T[];
/**
 * Immutably adds an index to an array.
 * @example
 * addItemToArray(["a", "b", "d"], "c", 2); // ["a", "b", "c", "d"]
 * @returns {Array} A new array with the item in the passed array index.
 */
export declare function addItemToArray<T extends any[]>(array: T, item: T[number], index?: number): T;
/**
 * Flattens a 2D array into a one-dimensional array.
 * @example
 * flatten2DArray([["a"], ["b"], ["c"]]); // ["a", "b", "c"]
 *
 * @returns {Array} A one-dimensional array.
 */
export declare function flatten2DArray<T>(array: T[][]): T[];
/**
 * Immutably reverses an array.
 * @example
 * reverseArray(["a", "b", "c"]); // ["c", "b", "a"]
 * @returns {Array} Reversed array.
 */
export declare function reverseArray<T>(array: T[]): T[];
