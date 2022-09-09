import { ComponentType, DependencyList, EffectCallback, MutableRefObject, Ref, RefCallback, RefObject, useLayoutEffect } from "react";
import * as React from "react";
import { AnyFunction, SetState } from "ariakit-utils/types";
import { WrapElement } from "./types";
/**
 * `React.useLayoutEffect` that fallbacks to `React.useEffect` on server side.
 */
export declare const useSafeLayoutEffect: typeof useLayoutEffect;
/**
 * Returns a value that never changes even if the argument is updated.
 * @example
 * function Component({ prop }) {
 *   const initialProp = useInitialValue(prop);
 * }
 */
export declare function useInitialValue<T>(value: T | (() => T)): T;
/**
 * Returns a value that is lazily initiated and never changes.
 * @example
 * function Component() {
 *   const set = useLazyValue(() => new Set());
 * }
 */
export declare function useLazyValue<T>(init: () => T): T;
/**
 * Creates a `React.RefObject` that is constantly updated with the incoming
 * value.
 * @example
 * function Component({ prop }) {
 *   const propRef = useLiveRef(prop);
 * }
 */
export declare function useLiveRef<T>(value: T): MutableRefObject<T>;
/**
 * Keeps the reference of the previous value to be used in the render phase.
 */
export declare function usePreviousValue<T>(value: T): T;
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
export declare function useEvent<T extends AnyFunction>(callback?: T): T;
/**
 * Merges React Refs into a single memoized function ref so you can pass it to
 * an element.
 * @example
 * const Component = React.forwardRef((props, ref) => {
 *   const internalRef = React.useRef();
 *   return <div {...props} ref={useForkRef(internalRef, ref)} />;
 * });
 */
export declare function useForkRef(...refs: Array<Ref<any> | undefined>): ((value: any) => void) | undefined;
/**
 * Returns the ref element's ID.
 */
export declare function useRefId(ref?: RefObject<HTMLElement>, deps?: DependencyList): string | undefined;
/**
 * Generates a unique ID. Uses React's useId if available.
 */
export declare function useId(defaultId?: string): string | undefined;
/**
 * Uses React's useDeferredValue if available.
 */
export declare function useDeferredValue<T>(value: T): T;
/**
 * Returns the tag name by parsing an element ref and the `as` prop.
 * @example
 * function Component(props) {
 *   const ref = React.useRef();
 *   const tagName = useTagName(ref, "button"); // div
 *   return <div ref={ref} {...props} />;
 * }
 */
export declare function useTagName(ref: RefObject<HTMLElement> | undefined, type?: string | ComponentType): string | undefined;
/**
 * A `React.useEffect` that will not run on the first render.
 */
export declare function useUpdateEffect(effect: EffectCallback, deps?: DependencyList): void;
/**
 * A `React.useLayoutEffect` that will not run on the first render.
 */
export declare function useUpdateLayoutEffect(effect: EffectCallback, deps?: DependencyList): void;
/**
 * A custom version of `React.useState` that uses the `state` and `setState`
 * arguments. If they're not provided, it will use the internal state.
 */
export declare function useControlledState<S>(defaultState: S | (() => S), state?: S, setState?: (value: S) => void): [S, SetState<S>];
/**
 * A React hook similar to `useState` and `useReducer`, but with the only
 * purpose of re-rendering the component.
 */
export declare function useForceUpdate(): [never[], React.DispatchWithoutAction];
/**
 * Returns an event callback similar to `useEvent`, but this also accepts a
 * boolean value, which will be turned into a function.
 */
export declare function useBooleanEvent<T extends unknown[]>(booleanOrCallback: boolean | ((...args: T) => boolean)): (...args: T) => boolean;
/**
 * Returns props with an additional `wrapElement` prop.
 */
export declare function useWrapElement<P>(props: P & {
    wrapElement?: WrapElement;
}, callback: WrapElement, deps?: DependencyList): P & {
    wrapElement: WrapElement;
};
/**
 * Merges the portalRef prop and returns a `domReady` to be used in the
 * components that use Portal underneath.
 */
export declare function usePortalRef(portalProp?: boolean, portalRefProp?: RefCallback<HTMLElement> | MutableRefObject<HTMLElement | null>): {
    portalRef: ((value: any) => void) | undefined;
    portalNode: HTMLElement | null;
    domReady: true | HTMLElement | null;
};
/**
 * Returns a function that checks whether the mouse is moving.
 */
export declare function useIsMouseMoving(): () => boolean;
