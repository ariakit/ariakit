export function pick<T extends Record<string, any>, K extends keyof T>(
  object: T,
  paths: ReadonlyArray<K> | K[]
) {
  const keys = Object.keys(object);
  const result = {} as { [P in K]: T[P] };

  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (paths.indexOf(key as K) >= 0) {
      result[key as K] = object[key];
    }
  }

  return result;
}

export default pick;
