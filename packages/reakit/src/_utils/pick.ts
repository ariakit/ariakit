function pick<T extends Record<string, any>, K extends keyof T>(
  object: T,
  paths: K[]
) {
  const keys = Object.keys(object);
  const result = {} as Pick<T, K>;

  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (paths.indexOf(key as K) >= 0) {
      result[key as K] = object[key];
    }
  }

  return result;
}

export default pick;
