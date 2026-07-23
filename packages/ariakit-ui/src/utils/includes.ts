export function includes<T>(array: readonly T[], value: unknown): value is T {
  return array.includes(value as T);
}
