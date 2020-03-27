/**
 * Splits an object (`props`) into a tuple where the first item is an object
 * with the passed `keys`, and the second item is an object with these keys
 * omitted.
 *
 * @example
 * import { splitProps } from "reakit-utils";
 *
 * splitProps({ a: "a", b: "b" }, ["a"]); // [{ a: "a" }, { b: "b" }]
 */
export function splitProps<T extends Record<string, any>, K extends keyof T>(
  props: T,
  keys: ReadonlyArray<K> | Array<K>
): [{ [P in K]: T[P] }, Omit<T, K>] {
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

  return [picked, omitted];
}
