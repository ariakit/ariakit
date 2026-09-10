export function keys<T extends Record<string, unknown>>(
  object: T,
): Array<keyof T> {
  return Object.keys(object);
}
