/**
 * Creates a stable accessor. Useful when creating derived accessors that
 * depend on a mutable variable that may change later.
 * @example
 * let value = 0;
 * const accessor = stableAccessor(value, (v) => v + 1);
 * value = 100;
 * accessor(); // 1
 */
export function stableAccessor<T, U>(
  value: T,
  callback: (value: T) => U,
): () => U {
  return () => callback(value);
}
