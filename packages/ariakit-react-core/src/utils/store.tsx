import * as React from "react";
import { hasOwnProperty, identity } from "@ariakit/core/utils/misc";
import { init, subscribe, sync } from "@ariakit/core/utils/store";
import type {
  Store as CoreStore,
  State,
  StoreState,
} from "@ariakit/core/utils/store";
import type {
  AnyFunction,
  AnyObject,
  PickByValue,
  SetState,
} from "@ariakit/core/utils/types";
import { flushSync } from "react-dom";
// import { useSyncExternalStore } from "use-sync-external-store/shim/index.js";
// This doesn't work in ESM, because use-sync-external-store only exposes CJS.
// The following is a workaround until ESM is supported.
import useSyncExternalStoreExports from "use-sync-external-store/shim/index.js";
const { useSyncExternalStore } = useSyncExternalStoreExports;
import { useEvent, useLiveRef, useSafeLayoutEffect } from "./hooks.js";

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

const noopSubscribe = () => () => {};

let inFlushSyncContext = false;

function safeFlushSync(fn: AnyFunction, canFlushSync = true) {
  if (inFlushSyncContext || !canFlushSync) {
    fn();
    return;
  }
  inFlushSyncContext = true;
  const originalError = console.error;
  if (process.env.NODE_ENV !== "production") {
    console.error = (msg: string) => {
      if (msg.startsWith("Warning: flushSync")) return;
      originalError(msg);
    };
  }
  try {
    flushSync(fn);
  } finally {
    console.error = originalError;
    inFlushSyncContext = false;
  }
}

export function useStoreState<T extends CoreStore>(store: T): StoreState<T>;

export function useStoreState<T extends CoreStore>(
  store: T | null | undefined,
): StoreState<T> | undefined;

export function useStoreState<T extends CoreStore, K extends StateKey<T>>(
  store: T,
  key: K,
): StoreState<T>[K];

export function useStoreState<T extends CoreStore, K extends StateKey<T>>(
  store: T | null | undefined,
  key: K,
): StoreState<T>[K] | undefined;

export function useStoreState<T extends CoreStore, V>(
  store: T,
  selector: (state: StoreState<T>) => V,
): V;

export function useStoreState<T extends CoreStore, V>(
  store: T | null | undefined,
  selector: (state?: StoreState<T>) => V,
): V;

export function useStoreState(
  store: StateStore,
  keyOrSelector: StateKey | ((state?: AnyObject) => any) = identity,
) {
  const storeSubscribe = React.useCallback(
    (callback: () => void) => {
      if (!store) return noopSubscribe();
      return subscribe(store, null, callback);
    },
    [store],
  );

  const getSnapshot = () => {
    const key = typeof keyOrSelector === "string" ? keyOrSelector : null;
    const selector = typeof keyOrSelector === "function" ? keyOrSelector : null;
    const state = store?.getState();
    if (selector) return selector(state);
    if (!state) return;
    if (!key) return;
    if (!hasOwnProperty(state, key)) return;
    return state[key];
  };

  return useSyncExternalStore(storeSubscribe, getSnapshot, getSnapshot);
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
  const canSyncValue = React.useRef(true);

  // Calls setValue when the state value changes.
  useSafeLayoutEffect(() => {
    let canFlushSync = false;
    // flushSync throws a warning if called from inside a lifecycle method.
    // Since the store.sync callback can be called immediately, we'll make it
    // use the flushSync function only in subsequent calls.
    queueMicrotask(() => {
      canFlushSync = true;
    });
    return sync(store, [key], (state, prev) => {
      const { value, setValue } = propsRef.current;
      if (!setValue) return;
      if (state[key] === prev[key]) return;
      if (state[key] === value) return;
      // Disable controlled value sync until the next render to avoid resetting
      // the value to a previous state before the component has a chance to
      // re-render.
      canSyncValue.current = false;
      safeFlushSync(() => setValue(state[key]), canFlushSync);
    });
  }, [store, key]);

  // If the value prop is provided, we'll always reset the store state to it.
  useSafeLayoutEffect(() => {
    if (value === undefined) return;
    canSyncValue.current = true;
    return sync(store, [key], () => {
      if (!canSyncValue.current) return;
      store.setState(key, value);
    });
  });
}

/**
 * Creates a React store from a core store object and returns a tuple with the
 * store and a function to update the store.
 * @param createStore A function that receives the props and returns a core
 * store object.
 * @param props The props to pass to the createStore function.
 */
export function useStore<T extends CoreStore, P>(
  createStore: (props: P) => T,
  props: P,
) {
  const [store, setStore] = React.useState(() => createStore(props));

  useSafeLayoutEffect(() => init(store), [store]);

  const useState: UseState<StoreState<T>> = React.useCallback<AnyFunction>(
    (keyOrSelector) => useStoreState(store, keyOrSelector),
    [store],
  );

  const memoizedStore = React.useMemo(
    () => ({ ...store, useState }),
    [store, useState],
  );

  const updateStore = useEvent(() => {
    setStore((store) => createStore({ ...props, ...store.getState() }));
  });

  return [memoizedStore, updateStore] as const;
}

export type Store<T extends CoreStore> = T & {
  /**
   * Re-renders the component when the state changes and returns the current
   * state.
   */
  useState: UseState<StoreState<T>>;
};
