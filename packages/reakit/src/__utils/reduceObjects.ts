/**
 * Transforms [{ a: "a" }, { a: "b" }] into { a: ["a", "b"] }
 */
export function reduceObjects<T extends Record<string, any>>(
  objects: T[],
  filter?: (value: T[keyof T], key: keyof T) => boolean
) {
  const result = {} as { [K in keyof T]?: Array<T[K]> };

  for (const object of objects) {
    const keys = Object.keys(object);
    for (const key of keys) {
      // eslint-disable-next-line no-continue
      if (filter && !filter(object[key], key)) continue;
      result[key] = [...(result[key] || []), object[key]];
    }
  }

  return result;
}
