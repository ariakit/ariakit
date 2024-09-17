import type { AnyObject } from "@ariakit/core/utils/types";
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

// https://github.com/microsoft/TypeScript/issues/31025#issuecomment-484734942
type NullablyRequired<T> = { [P in keyof T & keyof any]: T[P] };
export type ExtractPropsWithDefaultsExtractedProps<
  P,
  D extends Partial<R>,
  R = NullablyRequired<P>,
> = {
  -readonly [K in keyof R as Extract<K, keyof D>]: D[K] extends undefined
    ? R[K]
    : Exclude<R[K], undefined>;
};
export type ExtractPropsWithDefaultsRestProps<P, D extends Partial<P>> = Omit<
  P,
  keyof D
>;
export type ExtractPropsWithDefaultsReturn<P, D extends Partial<P>> = [
  ExtractPropsWithDefaultsExtractedProps<P, D>,
  ExtractPropsWithDefaultsRestProps<P, D>,
];

/**
 * Extracts props from a props object and applies defaults to them. The
 * return value is a tuple of the extracted props and the rest of the props.
 *
 * To extract a prop without a default, set it to `undefined`.
 * @example
 * const [extractedProps, restProps] = extractPropsWithDefaults(
 *   props,
 *   { orientation: "horizontal" },
 * );
 */
export function extractPropsWithDefaults<
  P extends AnyObject,
  const D extends Partial<P>,
>(props: P, defaults: D): ExtractPropsWithDefaultsReturn<P, D> {
  const [own, rest] = splitProps(props, Object.keys(defaults));
  return [
    mergeProps(defaults, own),
    rest,
  ] as unknown as ExtractPropsWithDefaultsReturn<P, D>;
}
