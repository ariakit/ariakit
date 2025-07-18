export function findInOrder<T, Value>(
  array: T[],
  key: keyof T | ((item: T) => Value),
  values: Value[],
) {
  for (const value of values) {
    const item = array.find((item) => {
      if (value == null) return false;
      if (typeof key === "function") {
        return key(item) === value;
      }
      return item[key] === value;
    });
    if (item) return item;
  }
  return null;
}

export function uniq<T>(array: T[]) {
  return [...new Set(array)];
}
