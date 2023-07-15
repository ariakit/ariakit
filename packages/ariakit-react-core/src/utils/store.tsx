import { useCallback, useMemo } from "react";
import { hasOwnProperty, identity } from "@ariakit/core/utils/misc";
import type {
  Store as CoreStore,
  State,
  StoreState,
} from "@ariakit/core/utils/store";
import type {
  AnyFunction,
  PickByValue,
  SetState,
} from "@ariakit/core/utils/types";
import { useSyncExternalStore } from "use-sync-external-store/shim/index.js";
import { useLazyValue, useLiveRef, useSafeLayoutEffect } from "./hooks.js";

type UseState<S> = {
  /**
   * Re-renders the component when state changes and returns the current state.
   * @example
   * const state = store.useState();
   */
  (): S;
  /**
   * Re-renders the component when the state changes and returns the current
   * state given the passed key. Changes on other keys will not trigger a
   * re-render.
   * @param key The state key.
   * @example
   * const foo = store.useState("foo");
   */
  <K extends keyof S>(key: K): S[K];
  /**
   * Re-renders the component when the state changes given the return value of
   * the selector function. The selector should return a stable value that will
   * be compared to the previous value. Returns the value returned by the
   * selector function.
   * @param selector The selector function.
   * @example
   * const foo = store.useState((state) => state.foo);
   */
  <V>(selector: (state: S) => V): V;
};

type StateStore<T = CoreStore> = T | null | undefined;
type StateKey<T = CoreStore> = keyof StoreState<T>;
type StateSelector<T = CoreStore, V = any> = (state: StoreState<T>) => V;

const noopSubscribe = () => () => {};

/**
 * Subscribes to and returns the entire state of a store.
 * @param store The store to subscribe to.
 * @example
 * useStoreState(store)
 */
export function useStoreState<T extends StateStore>(
  store: T,
): T extends CoreStore ? StoreState<T> : undefined;

/**
 * Subscribes to and returns a specific key of a store.
 * @param store The store to subscribe to.
 * @param key The key to subscribe to.
 * @example
 * useStoreState(store, "key")
 */
export function useStoreState<T extends StateStore, K extends StateKey<T>>(
  store: T,
  key: K,
): T extends CoreStore ? StoreState<T>[K] : undefined;

/**
 * Subscribes to and returns a computed value of a store based on the selector
 * function.
 * @param store The store to subscribe to.
 * @param selector The selector function that computes the observed value.
 * @example
 * useStoreState(store, (state) => state.key)
 */
export function useStoreState<T extends StateStore, V>(
  store: T,
  selector: StateSelector<T, V>,
): T extends CoreStore ? V : undefined;

export function useStoreState(
  store: StateStore,
  keyOrSelector: StateKey | StateSelector = identity,
) {
  const getSnapshot = () => {
    if (!store) return;
    const state = store.getState();
    const selector = typeof keyOrSelector === "function" ? keyOrSelector : null;
    const key = typeof keyOrSelector === "string" ? keyOrSelector : null;
    if (selector) return selector(state);
    if (!key) return;
    if (!hasOwnProperty(state, key)) return;
    return state[key];
  };
  return useSyncExternalStore(
    store?.subscribe || noopSubscribe,
    getSnapshot,
    getSnapshot,
  );
}

/**
 * Synchronizes the store with the props, including parent store props.
 * @param store The store to synchronize.
 * @param props The props to synchronize with.
 * @param key The key of the value prop.
 * @param setKey The key of the setValue prop.
 */
export function useStoreProps<
  S extends State,
  T extends CoreStore<S>,
  P extends S,
  K extends keyof S & keyof P,
  SK extends keyof PickByValue<P, SetState<P[K]>>,
>(store: T, props: P, key: K, setKey?: SK) {
  const value = hasOwnProperty(props, key) ? props[key] : undefined;
  const propsRef = useLiveRef({
    value,
    setValue: setKey ? (props[setKey] as SetState<S[K]>) : undefined,
  });

  // Calls setValue when the state value changes.
  useSafeLayoutEffect(() => {
    return store.sync(
      (state, prev) => {
        const { value, setValue } = propsRef.current;
        if (!setValue) return;
        if (state[key] === prev[key]) return;
        if (state[key] === value) return;
        setValue(state[key]);
      },
      [key],
    );
  }, [store, key]);

  // If the value prop is provided, we'll always reset the store state to it.
  useSafeLayoutEffect(() => {
    return store.sync(() => {
      if (value === undefined) return;
      store.setState(key, value);
    }, [key]);
  }, [store, key, value]);
}
/**
 * Creates a React store from a core store object.
 * @param createStore The function that creates the core store object.
 */
export function useStore<T extends CoreStore>(createStore: () => T): Store<T> {
  const store = useLazyValue(createStore);

  useSafeLayoutEffect(() => store.init(), [store]);

  const useState: UseState<StoreState<T>> = useCallback<AnyFunction>(
    (keyOrSelector) => useStoreState(store, keyOrSelector),
    [store],
  );

  return useMemo(() => ({ ...store, useState }), [store, useState]);
}

export type Store<T extends CoreStore> = T & {
  /**
   * Re-renders the component when the state changes and returns the current
   * state.
   */
  useState: UseState<StoreState<T>>;
};
