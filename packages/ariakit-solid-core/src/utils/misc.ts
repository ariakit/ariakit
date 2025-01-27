import type { AnyObject } from "@ariakit/core/utils/types";
import { combineProps } from "@solid-primitives/props";
import { type MaybeAccessor, access } from "@solid-primitives/utils";
import {
  type JSX,
  mergeProps as _mergeProps,
  createUniqueId,
  splitProps,
} from "solid-js";
import { $ } from "./props.ts";
import type { WrapInstance, WrapInstanceValue } from "./types.ts";

/**
 * Sets both a function and "object" ref.
 */
export function setRef<T>(
  ref: ((element: T) => void) | RefObject<T> | undefined,
  value: T,
) {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
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
 * return value is a tuple with the extracted props and the rest.
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
  const propsWithDefaults = _mergeProps(defaults, props);
  const [, rest] = splitProps(props, Object.keys(propsWithDefaults));
  return [
    // We return the base props to avoid one more layer. The output types
    // ensure that only the extracted props can be accessed.
    props,
    rest,
  ] as unknown as ExtractPropsWithDefaultsReturn<P, D>;
}

/**
 * Generates a unique ID.
 */
export function createId(
  defaultId?: MaybeAccessor<string | undefined>,
): string {
  const id = createUniqueId();
  return access(defaultId) ?? id;
}

/**
 * Returns the tag name by parsing an element.
 * @example
 * function Component(props) {
 *   const [element, setElement] = createSignal();
 *   const tagName = () => extractTagName(element(), "button"); // () => "div"
 *   return <div ref={setElement} {...props} />;
 * }
 */
export function extractTagName(
  element?: HTMLElement | undefined,
  fallback?: keyof JSX.IntrinsicElements,
) {
  return element?.tagName.toLowerCase() ?? fallback;
}

/**
 * Returns props with an additional `wrapInstance` prop.
 */
export function wrapInstance<P, Q = P & { wrapInstance: WrapInstance }>(
  props: P & { wrapInstance?: WrapInstance },
  element: WrapInstanceValue,
  _deps: Array<unknown>, // Only here to minimize the diff noise.
): Q {
  // @ts-expect-error - TODO: fix this type?
  return $(props)({
    $wrapInstance: (props) => [...(props.wrapInstance ?? []), element],
  }) as Q;
}

/**
 * A "ref" object that holds a value, created with the `createRef` function.
 * It is non-reactive.
 *
 * To bind to a JSX element, pass `ref.bind` to the `ref` prop.
 * @example
 * ```jsx
 * const ref = createRef();
 * // access the current value (non-reactive)
 * console.log(ref.current);
 * // update the value
 * ref.current = newValue;
 * // bind to an element in JSX
 * <button ref={ref.bind} />
 * ```
 */
export type RefObject<T> = {
  /**
   * The current value of the ref. Non-reactive.
   */
  current: T;
  /**
   * A setter function that can be passed to the `ref` prop of a JSX element.
   *
   * **Do not use this setter directly, use `ref.current = newValue` instead.**
   * @example
   * ```jsx
   * const ref = createRef();
   * <button ref={ref.bind} />
   * ```
   */
  bind: (value: T) => void;
};

/**
 * Creates a ref object that holds a value. It is non-reactive. Accepts an
 * initial value as the first argument, which is `undefined` by default.
 *
 * To bind to a JSX element, pass `ref.set` to the `ref` prop.
 * @example
 * ```jsx
 * const ref = createRef();
 * createEffect(() => {
 *   console.log(ref.value);
 * });
 * <button ref={ref.set}>Button</button>
 * ```
 */
export function createRef<T>(): RefObject<T | undefined>;
export function createRef<T>(initialValue: T | null): RefObject<T | null>;
export function createRef<T>(initialValue: T): RefObject<T>;
export function createRef<T>(initialValue?: any): RefObject<T> {
  let value = initialValue;
  return {
    get current() {
      return value;
    },
    set current(newValue) {
      value = newValue;
    },
    bind(newValue) {
      value = newValue;
    },
  };
}

function expandDollarGetters<T extends JSX.HTMLAttributes<any>>(props: T) {
  for (const key in props) {
    if (key.startsWith("$")) {
      const get = props[key] as () => unknown;
      delete props[key];
      Object.defineProperty(props, key.substring(1), {
        get,
        enumerable: true,
        configurable: true,
      });
    }
  }
}

type HTMLAttributesWithDollarGetters<T> = {
  [K in keyof JSX.HTMLAttributes<T> as `$${K}`]: () => JSX.HTMLAttributes<T>[K];
};

/**
 * Merges two sets of props.
 */
export function mergeProps<T extends JSX.HTMLAttributes<any>>(
  base: T & HTMLAttributesWithDollarGetters<T>,
  overrides: T,
) {
  expandDollarGetters(base);
  return combineProps([base, overrides], { reverseEventHandlers: true }) as T;
}
