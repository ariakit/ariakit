import {
  ComponentType,
  DependencyList,
  EffectCallback,
  MutableRefObject,
  MouseEvent as ReactMouseEvent,
  Ref,
  RefCallback,
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import * as React from "react";
import { canUseDOM } from "@ariakit/core/utils/dom";
import { addGlobalEventListener } from "@ariakit/core/utils/events";
import { applyState } from "@ariakit/core/utils/misc";
import { AnyFunction, SetState } from "@ariakit/core/utils/types";
import { setRef } from "./misc.js";
import { WrapElement } from "./types.js";

// @ts-ignore Access React v18 hooks using string concatenation in order to
// prevent Webpack from inferring that they are not present in React v17. For
// example, React.useId will raise a compile time error when using React v17,
// but React['use' + 'Id'] will not.
const useReactId = React["use" + "Id"] as typeof React.useId | undefined;
// @ts-ignore
const useReactDeferredValue = React["use" + "DeferredValue"] as
  | typeof React.useDeferredValue
  | undefined;
// @ts-ignore
const useInsertionEffect = React["use" + "InsertionEffect"] as
  | typeof React.useInsertionEffect
  | undefined;

/**
 * `React.useLayoutEffect` that fallbacks to `React.useEffect` on server side.
 */
export const useSafeLayoutEffect = canUseDOM ? useLayoutEffect : useEffect;

/**
 * Returns a value that never changes even if the argument is updated.
 * @example
 * function Component({ prop }) {
 *   const initialProp = useInitialValue(prop);
 * }
 */
export function useInitialValue<T>(value: T | (() => T)) {
  const [initialValue] = useState(value);
  return initialValue;
}

/**
 * Returns a value that is lazily initiated and never changes.
 * @example
 * function Component() {
 *   const set = useLazyValue(() => new Set());
 * }
 */
export function useLazyValue<T>(init: () => T) {
  const ref = useRef<T>();
  if (ref.current === undefined) {
    ref.current = init();
  }
  return ref.current;
}

/**
 * Creates a `React.RefObject` that is constantly updated with the incoming
 * value.
 * @example
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
 * Keeps the reference of the previous value to be used in the render phase.
 */
export function usePreviousValue<T>(value: T) {
  const [previousValue, setPreviousValue] = useState(value);
  if (value !== previousValue) {
    setPreviousValue(value);
  }
  return previousValue;
}

/**
 * Creates a stable callback function that has access to the latest state and
 * can be used within event handlers and effect callbacks. Throws when used in
 * the render phase.
 * @example
 * function Component(props) {
 *   const onClick = useEvent(props.onClick);
 *   React.useEffect(() => {}, [onClick]);
 * }
 */
export function useEvent<T extends AnyFunction>(callback?: T) {
  const ref = useRef<AnyFunction | undefined>(() => {
    throw new Error("Cannot call an event handler while rendering.");
  });
  if (useInsertionEffect) {
    useInsertionEffect(() => {
      ref.current = callback;
    });
  } else {
    ref.current = callback;
  }
  return useCallback<AnyFunction>((...args) => ref.current?.(...args), []) as T;
}

/**
 * Merges React Refs into a single memoized function ref so you can pass it to
 * an element.
 * @example
 * const Component = React.forwardRef((props, ref) => {
 *   const internalRef = React.useRef();
 *   return <div {...props} ref={useForkRef(internalRef, ref)} />;
 * });
 */
export function useForkRef(...refs: Array<Ref<any> | undefined>) {
  return useMemo(() => {
    if (!refs.some(Boolean)) return;
    return (value: any) => {
      refs.forEach((ref) => {
        setRef(ref, value);
      });
    };
  }, refs);
}

/**
 * Returns the ref element's ID.
 */
export function useRefId(ref?: RefObject<HTMLElement>, deps?: DependencyList) {
  const [id, setId] = useState<string | undefined>(undefined);
  useSafeLayoutEffect(() => {
    setId(ref?.current?.id);
  }, deps);
  return id;
}

/**
 * Generates a unique ID. Uses React's useId if available.
 */
export function useId(defaultId?: string): string | undefined {
  if (useReactId) {
    const reactId = useReactId();
    if (defaultId) return defaultId;
    return reactId;
  }
  const [id, setId] = useState(defaultId);
  useSafeLayoutEffect(() => {
    if (defaultId || id) return;
    const random = Math.random().toString(36).substr(2, 6);
    setId(`id-${random}`);
  }, [defaultId, id]);
  return defaultId || id;
}

/**
 * Uses React's useDeferredValue if available.
 */
export function useDeferredValue<T>(value: T): T {
  if (useReactDeferredValue) {
    return useReactDeferredValue(value);
  }
  const [deferredValue, setDeferredValue] = useState(value);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setDeferredValue(value));
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return deferredValue;
}

/**
 * Returns the tag name by parsing an element ref and the `as` prop.
 * @example
 * function Component(props) {
 *   const ref = React.useRef();
 *   const tagName = useTagName(ref, "button"); // div
 *   return <div ref={ref} {...props} />;
 * }
 */
export function useTagName(
  refOrElement?: RefObject<HTMLElement> | HTMLElement | null,
  type?: string | ComponentType
) {
  const stringOrUndefined = (type?: string | ComponentType) => {
    if (typeof type !== "string") return;
    return type;
  };

  const [tagName, setTagName] = useState(() => stringOrUndefined(type));

  useSafeLayoutEffect(() => {
    const element =
      refOrElement && "current" in refOrElement
        ? refOrElement.current
        : refOrElement;
    setTagName(element?.tagName.toLowerCase() || stringOrUndefined(type));
  }, [refOrElement, type]);

  return tagName;
}

/**
 * A `React.useEffect` that will not run on the first render.
 */
export function useUpdateEffect(effect: EffectCallback, deps?: DependencyList) {
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) {
      return effect();
    }
    mounted.current = true;
  }, deps);

  useEffect(
    () => () => {
      mounted.current = false;
    },
    []
  );
}

/**
 * A `React.useLayoutEffect` that will not run on the first render.
 */
export function useUpdateLayoutEffect(
  effect: EffectCallback,
  deps?: DependencyList
) {
  const mounted = useRef(false);

  useSafeLayoutEffect(() => {
    if (mounted.current) {
      return effect();
    }
    mounted.current = true;
  }, deps);

  useSafeLayoutEffect(
    () => () => {
      mounted.current = false;
    },
    []
  );
}

/**
 * A custom version of `React.useState` that uses the `state` and `setState`
 * arguments. If they're not provided, it will use the internal state.
 */
export function useControlledState<S>(
  defaultState: S | (() => S),
  state?: S,
  setState?: (value: S) => void
): [S, SetState<S>] {
  const [localState, setLocalState] = useState(defaultState);
  const nextState = state !== undefined ? state : localState;

  const stateRef = useLiveRef(state);
  const setStateRef = useLiveRef(setState);
  const nextStateRef = useLiveRef(nextState);

  const setNextState = useCallback((prevValue: S) => {
    const setStateProp = setStateRef.current;
    if (setStateProp) {
      if (isSetNextState(setStateProp)) {
        setStateProp(prevValue);
      } else {
        const nextValue = applyState(prevValue, nextStateRef.current);
        nextStateRef.current = nextValue;
        setStateProp(nextValue);
      }
    }
    if (stateRef.current === undefined) {
      setLocalState(prevValue);
    }
  }, []);

  defineSetNextState(setNextState);

  return [nextState, setNextState];
}

const SET_NEXT_STATE = Symbol("setNextState");

function isSetNextState(arg: AnyFunction & { [SET_NEXT_STATE]?: true }) {
  return arg[SET_NEXT_STATE] === true;
}

function defineSetNextState(arg: AnyFunction & { [SET_NEXT_STATE]?: true }) {
  if (!isSetNextState(arg)) {
    Object.defineProperty(arg, SET_NEXT_STATE, { value: true });
  }
}

/**
 * A React hook similar to `useState` and `useReducer`, but with the only
 * purpose of re-rendering the component.
 */
export function useForceUpdate() {
  return useReducer(() => [], []);
}

/**
 * Returns an event callback similar to `useEvent`, but this also accepts a
 * boolean value, which will be turned into a function.
 */
export function useBooleanEvent<T extends unknown[]>(
  booleanOrCallback: boolean | ((...args: T) => boolean)
) {
  return useEvent(
    typeof booleanOrCallback === "function"
      ? booleanOrCallback
      : () => booleanOrCallback
  );
}

/**
 * Returns props with an additional `wrapElement` prop.
 */
export function useWrapElement<P>(
  props: P & { wrapElement?: WrapElement },
  callback: WrapElement,
  deps: DependencyList = []
): P & { wrapElement: WrapElement } {
  const wrapElement: WrapElement = useCallback(
    (element) => {
      if (props.wrapElement) {
        element = props.wrapElement(element);
      }
      return callback(element);
    },
    [...deps, props.wrapElement]
  );

  return { ...props, wrapElement };
}

/**
 * Merges the portalRef prop and returns a `domReady` to be used in the
 * components that use Portal underneath.
 */
export function usePortalRef(
  portalProp = false,
  portalRefProp?:
    | RefCallback<HTMLElement>
    | MutableRefObject<HTMLElement | null>
) {
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);
  const portalRef = useForkRef(setPortalNode, portalRefProp);
  const domReady = !portalProp || portalNode;
  return { portalRef, portalNode, domReady };
}

/**
 * Returns a function that checks whether the mouse is moving.
 */
export function useIsMouseMoving() {
  useEffect(() => {
    // We're not returning the event listener cleanup function here because we
    // may lose some events if this component is unmounted, but others are
    // still mounted.
    addGlobalEventListener("mousemove", setMouseMoving, true);
    // See https://github.com/ariakit/ariakit/issues/1137
    addGlobalEventListener("mousedown", resetMouseMoving, true);
    addGlobalEventListener("mouseup", resetMouseMoving, true);
    addGlobalEventListener("keydown", resetMouseMoving, true);
    addGlobalEventListener("scroll", resetMouseMoving, true);
  }, []);

  const isMouseMoving = useEvent(() => mouseMoving);

  return isMouseMoving;
}

let mouseMoving = false;
let previousScreenX = 0;
let previousScreenY = 0;

function hasMouseMovement(event: ReactMouseEvent | MouseEvent) {
  const movementX = event.movementX || event.screenX - previousScreenX;
  const movementY = event.movementY || event.screenY - previousScreenY;
  previousScreenX = event.screenX;
  previousScreenY = event.screenY;
  return movementX || movementY || process.env.NODE_ENV === "test";
}

function setMouseMoving(event: MouseEvent) {
  if (!hasMouseMovement(event)) return;
  mouseMoving = true;
}

function resetMouseMoving() {
  mouseMoving = false;
}
