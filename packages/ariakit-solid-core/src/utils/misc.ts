import { type MaybeAccessor, access } from "@solid-primitives/utils";
import { type JSX, createUniqueId } from "solid-js";
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
  return $(props as JSX.HTMLAttributes<any> & { wrapInstance?: WrapInstance })({
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
