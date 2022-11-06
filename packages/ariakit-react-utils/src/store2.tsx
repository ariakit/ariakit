import { useCallback, useMemo } from "react";
import { hasOwnProperty, identity } from "ariakit-utils/misc";
import {
  Store as CoreStore,
  Listener,
  ParentStore,
  PartialStore,
  StoreState,
} from "ariakit-utils/store";
import { AnyFunction, PickByValue, SetState } from "ariakit-utils/types";
import { unstable_batchedUpdates } from "react-dom";
import { useSyncExternalStore } from "use-sync-external-store/shim";
import {
  useEvent,
  useLazyValue,
  useLiveRef,
  useSafeLayoutEffect,
  useUpdateLayoutEffect,
} from "./hooks";

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

// eslint-disable-next-line @typescript-eslint/ban-types
type UseSubscribeKeys<S> = Array<keyof S | {} | undefined | null>;

type UseSubscribe<S> = {
  <K extends UseSubscribeKeys<S> = Array<keyof S>>(
    listener: Listener<Pick<S, Extract<K[number], keyof S>>>,
    keys?: K | UseSubscribeKeys<S>
  ): void;
};

type UseWith<S> = {
  <K extends keyof S>(...keys: K[]): Store<CoreStore<Pick<S, K>>>;
};

type UseWithout<S> = {
  <K extends keyof S>(...keys: K[]): Store<CoreStore<Omit<S, K>>>;
};

type StateStore<T = CoreStore> = T | null | undefined;
type StateKey<T = CoreStore> = keyof StoreState<T>;
type StateSelector<T = CoreStore, V = any> = (state: StoreState<T>) => V;

const noopSubscribe = () => () => {};

function batchUpdates<T>(fn: () => T) {
  let result: T | undefined;
  unstable_batchedUpdates(() => {
    result = fn();
  });
  return result;
}

/**
 * Subscribes to and returns the entire state of a store.
 * @param store The store to subscribe to.
 * @example
 * useStoreState(store)
 */
export function useStoreState<T extends StateStore>(
  store: T
): T extends CoreStore ? StoreState<T> : null;

/**
 * Subscribes to and returns a specific key of a store.
 * @param store The store to subscribe to.
 * @param key The key to subscribe to.
 * @example
 * useStoreState(store, "key")
 */
export function useStoreState<T extends StateStore, K extends StateKey<T>>(
  store: T,
  key: K
): T extends CoreStore ? StoreState<T>[K] : null;

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
  selector: StateSelector<T, V>
): T extends CoreStore ? V : null;

export function useStoreState(
  store: StateStore,
  keyOrSelector: StateKey | StateSelector = identity
) {
  const getSnapshot = () => {
    if (!store) return null;
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
    getSnapshot
  );
}

/**
 * Synchronizes the store with the props, including parent store props.
 * @param store The store to synchronize.
 * @param props The props to synchronize with.
 * @param valueKey The key of the value prop.
 * @param setValueKey The key of the setValue prop.
 */
export function useStoreSync<
  T extends Store<CoreStore>,
  P extends PartialStore,
  K extends keyof StoreState<T>,
  SK extends keyof PickByValue<P, SetState<StoreState<T>[K]>>
>(store: T, props: P, valueKey: K, setValueKey?: SK) {
  const value = hasOwnProperty(props, valueKey) ? props[valueKey] : undefined;
  const hasValue = value !== undefined;
  const valueRef = useLiveRef(value);
  const parentSync = props.sync;
  const parentSetState = useEvent(props.setState);
  const parentSetValue = useEvent(
    setValueKey ? (props[setValueKey] as SetState<StoreState<T>[K]>) : undefined
  );

  // Synchronize the value coming from the state with the parent store as in
  // useComponentStore(useParentStore()). See
  // https://ariakit.org/examples/menu-combobox
  store.useSync(
    (state) => {
      const key = valueKey as keyof typeof state;
      const stateValue = state[key] as StoreState<T>[K];
      parentSetValue(stateValue);
      if (valueRef.current !== undefined) {
        // If useComponentStore({ key: "value" }) is provided, we reset the
        // state. See https://ariakit.org/examples/dialog-react-router (open:
        // true)
        store.setState(valueKey, valueRef.current);
      } else {
        parentSetState(valueKey, stateValue);
      }
    },
    [valueKey]
  );

  // When the props[key] value changes in useComponentStore({ key: "value" }),
  // we set the store value.
  useUpdateLayoutEffect(() => {
    if (value === undefined) return;
    store.setState(valueKey, value);
  }, [value, store, valueKey]);

  // Synchronize the parent state[key] with the current store.
  useSafeLayoutEffect(() => {
    if (hasValue) return;
    return parentSync?.(
      (state) => {
        if (state[valueKey] === undefined) return;
        store.setState(valueKey, state[valueKey]!);
      },
      [valueKey]
    );
  }, [hasValue, parentSync, valueKey, store]);
}

/**
 * Creates a React store from a core store object.
 * @param createStore The function that creates the core store object.
 */
export function useStore<T extends CoreStore>(createStore: () => T): Store<T> {
  const { setup, ...store } = useLazyValue(createStore);

  useSafeLayoutEffect(() => setup?.(), [setup]);

  const sync = useEvent(store.sync);
  const subscribe = useEvent(store.subscribe);
  const effect = useEvent(store.effect);
  const setState = useEvent(store.setState);

  const useState: UseState<StoreState<T>> = useCallback<AnyFunction>(
    (keyOrSelector) => useStoreState(store, keyOrSelector),
    []
  );

  // useSync is similar to useEffect, but it's called on every state change,
  // whereas useEffect is batched.
  const useSync: UseSubscribe<StoreState<T>> = useCallback<AnyFunction>(
    (listener, keys) => {
      useSafeLayoutEffect(() => {
        return sync((state, prevState) => {
          return batchUpdates(() => listener(state, prevState));
        }, keys);
      }, keys);
    },
    []
  );

  const useEffect: UseSubscribe<StoreState<T>> = useCallback<AnyFunction>(
    (listener, keys) => {
      useSafeLayoutEffect(() => {
        return effect((state, prevState) => {
          return batchUpdates(() => listener(state, prevState));
        });
      }, keys);
    },
    []
  );

  const useWith: UseWith<StoreState<T>> = useCallback<AnyFunction>(
    (...keys) => useStore(() => store.pick(...keys)),
    []
  );

  const useWithout: UseWithout<StoreState<T>> = useCallback<AnyFunction>(
    (...keys) => useStore(() => store.omit(...keys)),
    []
  );

  return useMemo(
    () => ({
      ...store,
      sync,
      subscribe,
      effect,
      setState,
      useState,
      useSync,
      useEffect,
      useWith,
      useWithout,
    }),
    []
  );
}

export type Store<T extends CoreStore> = Omit<T, "setup"> & {
  /**
   * Re-renders the component when the state changes and returns the current
   * state.
   */
  useState: UseState<StoreState<T>>;
  /**
   * Registers a listener function that's called immediately and synchronously
   * whenever the store state changes.
   */
  useSync: UseSubscribe<StoreState<T>>;
  /**
   * Registers a listener function that's called immediately and after a batch
   * of state changes in the store.
   */
  useEffect: UseSubscribe<StoreState<T>>;
  /**
   * Creates a new store with a subset of the current store state and keeps them
   * in sync.
   */
  useWith: UseWith<StoreState<T>>;
  /**
   * Creates a new store with a subset of the current store state and keeps them
   * in sync.
   */
  useWithout: UseWithout<StoreState<T>>;
};

export type { ParentStore };
