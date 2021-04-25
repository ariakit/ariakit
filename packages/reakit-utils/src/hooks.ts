import {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  Ref,
  MutableRefObject,
  useMemo,
  RefObject,
  ComponentType,
  EffectCallback,
  useCallback,
} from "react";
import { canUseDOM, getNativeElementType } from "./dom";
import { AnyFunction, InitialState } from "./types";

/**
 * `React.useLayoutEffect` that fallbacks to `React.useEffect` on server side.
 */
export const useSafeLayoutEffect = canUseDOM ? useLayoutEffect : useEffect;

/**
 * Returns a value that never changes even if the argument is updated.
 *
 * @example
 * import { useInitialValue } from "reakit-utils";
 *
 * function Component({ prop }) {
 *   const initialProp = useInitialValue(prop);
 * }
 */
export function useInitialValue<T>(value: InitialState<T>) {
  const [initialValue] = useState(value);
  return initialValue;
}

/**
 * Returns a value that is lazily initiated and never changes.
 *
 * @example
 * import { useLazyRef } from "reakit-utils";
 *
 * function Component() {
 *   const set = useLazyRef(() => new Set());
 * }
 */
export function useLazyRef<T>(init: () => T) {
  const ref = useRef<T>();
  if (ref.current === undefined) {
    ref.current = init();
  }
  return ref.current;
}

/**
 * Creates a `React.RefObject` that is constantly updated with the incoming
 * value.
 *
 * @example
 * import { useLiveRef } from "reakit-utils";
 *
 * function Component({ prop }) {
 *   const propRef = useLiveRef(prop);
 * }
 */
export function useLiveRef<T>(value: T) {
  const ref = useRef(value);
  useSafeLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}

/**
 * Creates a memoized callback function that is constantly updated with the
 * incoming callback.
 *
 * @example
 * import { useEffect } from "react";
 * import { useEventCallback } from "reakit-utils";
 *
 * function Component(props) {
 *   const onClick = useEventCallback(props.onClick);
 *   useEffect(() => {}, [onClick]);
 * }
 */
export function useEventCallback<T extends AnyFunction>(callback?: T) {
  // @ts-ignore
  const ref = useRef<T | undefined>(() => {
    throw new Error("Cannot call an event handler while rendering.");
  });
  useSafeLayoutEffect(() => {
    ref.current = callback;
  });
  return useCallback(
    (...args: Parameters<T>): ReturnType<T> => ref.current?.(...args),
    []
  );
}

/**
 * Merges React Refs into a single memoized function ref so you can pass it to
 * an element.
 *
 * @example
 * import { forwardRef, useRef } from "react";
 * import { useForkRef } from "reakit-utils";
 *
 * const Component = forwardRef((props, ref) => {
 *   const internalRef = useRef();
 *   return <div {...props} ref={useForkRef(internalRef, ref)} />;
 * });
 */
export function useForkRef(...refs: Array<Ref<any> | undefined>) {
  return useMemo(() => {
    if (!refs.some(Boolean)) return null;
    return (value: any) => {
      refs.forEach(setRef(value));
    };
  }, refs);
}

function setRef(value: any = null) {
  return (ref?: Ref<any>) => {
    if (!ref) return;
    if (typeof ref === "function") {
      ref(value);
    } else {
      (ref as MutableRefObject<any>).current = value;
    }
  };
}

/**
 * Returns the native tag name of an element by parsing its ref object. If the
 * second argument `defaultType` is provided, it's going to be used by default
 * on the first render, before React runs the effects.
 *
 * @example
 * import * as React from "react";
 * import { useNativeElementType } from "reakit-utils";
 *
 * function Component(props) {
 *   const ref = React.useRef();
 *   // button on the first render, div on the second render
 *   const type = useNativeElementType(ref, "button");
 *   return <div ref={ref} {...props} />;
 * }
 */
export function useNativeElementType(
  ref: RefObject<Element>,
  defaultType?: string | ComponentType
) {
  const [type, setType] = useState(() =>
    getNativeElementType(null, defaultType)
  );

  useSafeLayoutEffect(() => {
    setType(getNativeElementType(ref.current, defaultType));
  }, [ref, defaultType]);

  return type;
}

/**
 * A `React.useEffect` that will not run on the first render.
 */
export function useUpdateEffect(
  effect: EffectCallback,
  deps?: ReadonlyArray<any> | undefined
) {
  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) {
      return effect();
    }
    mounted.current = true;
    return undefined;
  }, deps);
}
