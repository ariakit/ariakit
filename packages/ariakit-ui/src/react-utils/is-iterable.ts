/**
 * Returns whether a value safely implements the iterable protocol.
 */
export function isIterable(obj: any): obj is Iterable<any> {
  if (obj == null) return false;
  return typeof obj[Symbol.iterator] === "function";
}
