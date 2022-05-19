import {
  Context,
  ReactElement,
  createContext,
  memo,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { toArray } from "./array";
import {
  useInitialValue,
  useLazyValue,
  useSafeLayoutEffect,
  useWrapElement,
} from "./hooks";
import { shallowEqual } from "./misc";
import { createComponent } from "./system";
import { BivariantCallback, Options, Props, WrapElement } from "./types";

const GET_STATE = Symbol("getState");
const SUBSCRIBE = Symbol("subscribe");
const TIMESTAMP = Symbol("timestamp");
const INITIAL_CONTEXT = Symbol("initialContext");

type Listener<T> = (state: T) => any;
type GetState<T> = () => T;
type Subscribe<T> = (listener: Listener<T>) => () => any;
type StateFilterFn<T> = BivariantCallback<(nextState: T) => unknown>;
type StateFilterDeps<T> = Array<StateFilterFn<T> | keyof NonNullable<T>>;
type StateFilter<T> = StateFilterDeps<T> | StateFilterFn<T>;

function getState<T>(state: T & { [GET_STATE]?: GetState<T> }) {
  if (!state) return state;
  const fn = state[GET_STATE];
  if (fn) return fn();
  return state;
}

function hasSubscribe<T>(state: T & { [SUBSCRIBE]?: Subscribe<T> }) {
  if (!state) return false;
  return !!state[SUBSCRIBE];
}

function getSubscribe<T>(state: T & { [SUBSCRIBE]?: Subscribe<T> }) {
  if (!state) return;
  return state[SUBSCRIBE];
}

function getLatest<T>(
  a: T & { [TIMESTAMP]?: number },
  b: T & { [TIMESTAMP]?: number }
): T {
  if (!b) return a;
  if (!a) return b;
  if (!(TIMESTAMP in b)) return a;
  if (!(TIMESTAMP in a)) return b;
  if (a[TIMESTAMP]! >= b[TIMESTAMP]!) return a;
  return b;
}

function defineGetState<T>(state: T, currentState = state) {
  Object.defineProperty(state, GET_STATE, {
    value: () => currentState,
    writable: true,
  });
}

function defineSubscribe<T>(state: T, subscribe: Subscribe<T>) {
  if (!(SUBSCRIBE in state)) {
    Object.defineProperty(state, SUBSCRIBE, { value: subscribe });
  }
}

function defineTimestamp<T>(state: T) {
  if (!(TIMESTAMP in state)) {
    Object.defineProperty(state, TIMESTAMP, {
      value: Date.now(),
      writable: true,
    });
  }
}

function patchState<T>(state: T & { [TIMESTAMP]?: number }) {
  Object.defineProperty(state, TIMESTAMP, {
    value: Date.now(),
    writable: true,
  });
}

function defineInitialContext<T>(context: Context<T>) {
  const initialContext = createContext<T | undefined>(undefined);
  Object.defineProperty(context, INITIAL_CONTEXT, { value: initialContext });
  return initialContext;
}

function hasInitialContext<T>(
  stateOrContext: T | Context<T>
): stateOrContext is Context<T> {
  return stateOrContext && INITIAL_CONTEXT in stateOrContext;
}

function getInitialContext<T>(context: Context<T>) {
  if (!hasInitialContext(context)) return;
  const ctx = context as Context<T> & { [INITIAL_CONTEXT]: Context<T> };
  return ctx[INITIAL_CONTEXT];
}

/**
 * Creates a context that can be passed to `useStore` and `useStoreProvider`.
 */
export function createStoreContext<T>() {
  const context = createContext<T | undefined>(undefined);
  defineInitialContext(context);
  return context;
}

/**
 * Creates a type-safe component with the `as` prop, `state` prop,
 * `React.forwardRef` and `React.memo`.
 *
 * @example
 * import { Options, createMemoComponent } from "ariakit-utils/store";
 *
 * type Props = Options<"div"> & {
 *   state?: { customProp: boolean };
 * };
 *
 * const Component = createMemoComponent<Props>(
 *   ({ state, ...props }) => <div {...props} />
 * );
 *
 * <Component as="button" state={{ customProp: true }} />
 */
export function createMemoComponent<O extends Options & { state?: unknown }>(
  render: (props: Props<O>) => ReactElement,
  propsAreEqual: (prev: Props<O>, next: Props<O>) => boolean = shallowEqual
) {
  const Role = createComponent(render);
  return memo(Role, (prev, next) => {
    const { state: prevState, ...prevProps } = prev;
    const { state: nextState, ...nextProps } = next;
    if (nextState && hasSubscribe(nextState)) {
      return propsAreEqual(prevProps as Props<O>, nextProps as Props<O>);
    }
    return propsAreEqual(prev, next);
  }) as unknown as typeof Role;
}

/**
 * Returns props with a `wrapElement` function that wraps an element with a
 * React Context Provider that provides a store context to consumers.
 * @example
 * import * as React from "react";
 * import { useStoreProvider } from "ariakit-utils/store";
 *
 * const StoreContext = createStoreContext();
 *
 * function Component({ state, ...props }) {
 *   const { wrapElement } = useStoreProvider({ state, ...props }, StoreContext);
 *   return wrapElement(<div {...props} />);
 * }
 */
export function useStoreProvider<P, S>(
  { state, ...props }: P & { state?: S; wrapElement?: WrapElement },
  context: Context<S>
) {
  const initialValue = useInitialValue(state);
  const value = state && hasSubscribe(state) ? initialValue : state;

  defineGetState(value, state);

  const initialContext = getInitialContext(context);

  return useWrapElement(
    props,
    (element) => {
      if (value && initialContext) {
        element = (
          <initialContext.Provider value={value}>
            {element}
          </initialContext.Provider>
        );
      }
      if (state) {
        element = <context.Provider value={state}>{element}</context.Provider>;
      }
      return element;
    },
    [value, initialContext, state, context]
  );
}

/**
 * Adds publishing capabilities to state so it can be passed to `useStore` or
 * `useStoreProvider` later.
 * @example
 * import { useStorePublisher } from "ariakit-utils/store";
 *
 * function useComponentState() {
 *   const state = React.useMemo(() => ({ a: "a" }), []);
 *   return useStorePublisher(state);
 * }
 */
export function useStorePublisher<T>(state: T) {
  const listeners = useLazyValue(() => new Set<Listener<T>>());

  useSafeLayoutEffect(() => {
    patchState(state);
    for (const listener of listeners) {
      listener(state);
    }
  }, [state]);

  const subscribe = useCallback((listener: Listener<T>) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);

  defineSubscribe(state, subscribe);
  defineGetState(state);
  defineTimestamp(state);

  return state;
}

/**
 * Handles state updates on the state or context state passed as the first
 * argument based on the filter argument.
 * @example
 * import { useStore } from "ariakit-utils/store";
 *
 * const ContextState = createContextState();
 *
 * function Component({ state }) {
 *   state = useStore(state || ContextState, ["stateProp"]);
 * }
 */
export function useStore<T>(
  stateOrContext: T | Context<T>,
  filter?: StateFilter<T>
) {
  const contextState = useContext(getContext(stateOrContext, filter));
  const externalState = hasInitialContext(stateOrContext)
    ? contextState
    : stateOrContext;
  const [internalState, setState] = useState(() => getState(externalState));

  const state =
    hasSubscribe(externalState) && hasSubscribe(internalState)
      ? getLatest(internalState, externalState)
      : externalState;

  const subscribe = getSubscribe(externalState);
  const prevStateRef = useRef<T | null>(null);
  const deps = toArray(filter);
  const noFilter = !filter;

  useSafeLayoutEffect(() => {
    if (!subscribe) return;
    if (noFilter) return subscribe(setState);
    if (!deps.length) return;
    return subscribe((nextState) => {
      const prevState = prevStateRef.current;
      prevStateRef.current = nextState;
      const filterDep = (dep: typeof deps[number]) => {
        if (typeof dep === "function") {
          const result = dep(nextState);
          // TODO: We probably need different functions for:
          // useStore(context, [(nextState) => nextState.activeId === id]);
          // useStore(context, [(nextState) => nextState.booleanProp]);
          // Because in the second case we want to compare the result with the
          // previous state result.
          if (typeof result === "boolean") {
            return result || (prevState && dep(prevState));
          } else if (prevState) {
            return result !== dep(prevState);
          }
          return result;
        }
        const key = dep as keyof T;
        return prevState?.[key] !== nextState[key];
      };
      if (deps.some(filterDep)) {
        setState(nextState);
      }
    });
  }, [subscribe, setState, noFilter, ...deps]);

  return state;
}

const EmptyContext = createContext(undefined as unknown);

function getContext<T>(
  stateOrContext: T | Context<T>,
  filter?: StateFilter<T>
) {
  if (!hasInitialContext(stateOrContext)) {
    return EmptyContext as Context<T>;
  }
  if (filter) {
    return getInitialContext(stateOrContext)!;
  }
  return stateOrContext;
}
