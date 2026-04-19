import type { AnyObject } from "@ariakit/core/utils/types";
import { combineProps } from "@solid-primitives/props";
import type { Accessor, JSX, Setter } from "solid-js";
import {
  createSignal,
  mergeProps as solidMergeProps,
  splitProps,
  untrack,
} from "solid-js";

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
    solidMergeProps(defaults, own),
    rest,
  ] as unknown as ExtractPropsWithDefaultsReturn<P, D>;
}

/**
 * A ref object that contains the value getter (`value`) and setter (`set`) as
 * properties for convenience. It also has a `reset` method that can be used to
 * set the value to the initial value that was passed, which is `undefined` by
 * default. The `current` getter can be used to obtain the value without
 * tracking it reactively.
 *
 * Created by the `createRef` function.
 * @example
 * const ref = createRef();
 * createEffect(() => {
 *   console.log(ref.value);
 * });
 * ref.set(buttonElement);
 * ref.reset();
 */
export type RefStore<T> = {
  /**
   * The current value of the ref. It is a non-reactive getter, wrapped with
   * the `untrack` function.
   *
   * **Important note**: since this is a getter, TypeScript might reflect the
   * wrong type in some cases. For example:
   *
   * ```ts
   * const ref = createRef<number>(); // ref.current type: number | undefined
   * ref.set(1);
   * console.log(ref.current); // 1
   * if (ref.current) {
   *   // ref.current type: number (narrowed by the if statement)
   *   console.log(ref.current); // 1
   *   ref.set(undefined);
   *   // ref.current type: number (wrong!)
   *   console.log(ref.current); // undefined
   * }
   * ```
   */
  current: T;
  /**
   * The getter function for the ref.
   */
  get: Accessor<T>;
  /**
   * The setter function for the ref.
   */
  set: Setter<T>;
  /**
   * Resets the ref to the initial value that was passed, which is `undefined`
   * by default.
   */
  reset: () => void;
};

/**
 * Creates a ref object that contains the value getter (`value`) and setter
 * (`set`) as properties for convenience. It also has a `reset` method that
 * can be used to set the value to the initial value that was passed,
 * which is `undefined` by default. The `current` getter can be used to obtain
 * the value without tracking it reactively.
 * @example
 * ```jsx
 * const ref = createRef();
 * createEffect(() => {
 *   console.log(ref.value);
 * });
 * <button ref={ref.set}>Button</button>
 * ```
 */
export function createRef<T>(): RefStore<T | undefined>;
export function createRef<T>(initialValue: T): RefStore<T>;
export function createRef<T>(initialValue?: any): RefStore<T> {
  const [get, set] = createSignal<T>(initialValue);
  return {
    get current() {
      return untrack(() => get());
    },
    get,
    set,
    reset: () => set(initialValue),
  };
}

/**
 * Merges two sets of props.
 */
export function mergeProps<T extends JSX.HTMLAttributes<any>>(
  base: T,
  overrides: T,
  skipProps?: Array<keyof T>,
) {
  return combineProps(
    [base, skipProps ? splitProps(overrides, skipProps)[1] : overrides],
    { reverseEventHandlers: true },
  ) as T;
}
