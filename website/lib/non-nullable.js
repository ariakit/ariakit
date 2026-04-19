/**
 * @template T
 * @param {T} value
 * @returns {value is NonNullable<T>}
 */
export function nonNullable(value) {
  return value != null;
}
