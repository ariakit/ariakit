import { Omit } from "./types";

export function splitProps<T extends Record<string, any>, K extends keyof T>(
  props: T,
  keys: ReadonlyArray<K> | Array<K>
) {
  const propsKeys = Object.keys(props);
  const picked = {} as { [P in K]: T[P] };
  const omitted = {} as Omit<T, K>;

  for (const key of propsKeys) {
    if (keys.indexOf(key as K) >= 0) {
      picked[key as K] = props[key];
    } else {
      omitted[key as Exclude<keyof T, K>] = props[key];
    }
  }

  return [picked, omitted] as [typeof picked, typeof omitted];
}
