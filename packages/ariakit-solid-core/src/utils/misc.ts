import { mergeProps, splitProps } from "solid-js";

/**
 * Creates a stable accessor. Useful when creating derived accessors that
 * depend on a mutable variable that may change later.
 * @example
 * let value = 0;
 * const accessor = stableAccessor(value, (v) => v + 1);
 * value = 100;
 * accessor(); // 1
 */
export function stableAccessor<T, U>(
  value: T,
  callback: (value: T) => U,
): () => U {
  return () => callback(value);
}

export type ExtractPropsWithDefaults<T, D extends { [P in keyof T]?: T[P] }> = {
  -readonly [P in keyof D]: P extends keyof T
    ? D[P] extends undefined
      ? T[P]
      : Exclude<T[P], undefined>
    : never;
};

// TODO: explore integrating this into createHook or creating some sort of
// intermediate utility.
/**
 * Extracts props from a props object and applies defaults to them. The
 * rest of the props are set through the provided setter. To extract a
 * prop without a default, set it to `undefined`.
 * @example
 * const extractedProps = extractPropsWithDefaults(
 *   props,
 *   (p) => (props = p),
 *   { orientation: "horizontal" },
 * );
 * extractedProps.orientation; // "horizontal"
 */
export function extractPropsWithDefaults<
  T extends Record<any, any>,
  const D extends { [P in keyof T]?: T[P] },
>(
  props: T,
  setter: (props: T) => void,
  defaults: D,
): ExtractPropsWithDefaults<T, D> {
  const [own, rest] = splitProps(props, Object.keys(defaults));
  setter(rest as T);
  return mergeProps(defaults, own) as ExtractPropsWithDefaults<T, D>;
}
