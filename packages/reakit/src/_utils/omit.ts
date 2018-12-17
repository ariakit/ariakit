import { Omit } from "./types";

function omit<T extends Record<string, any>, K extends keyof T>(
  object: T,
  ...paths: K[]
) {
  const keys = Object.keys(object);
  const result: Record<string, any> = {};

  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    if (paths.indexOf(key as K) === -1) {
      result[key] = object[key];
    }
  }

  return result as Omit<T, K>;
}

export default omit;
