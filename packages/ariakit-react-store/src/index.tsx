import {
  useEvent,
  useLiveRef,
  useSafeLayoutEffect,
} from "@ariakit/react-utils";
import { batch, init, subscribe } from "@ariakit/store";
import type { Store as CoreStore, State, StoreState } from "@ariakit/store";
import { hasOwnProperty, identity } from "@ariakit/utils";
import type { AnyFunction, PickByValue, SetState } from "@ariakit/utils";
import * as React from "react";
import { useSyncExternalStore } from "use-sync-external-store/shim";

export interface UseState<S> {
  /**
   * Re-renders the component when state changes and returns the current state.
   * @deprecated Use
   * [`useStoreState`](https://ariakit.com/reference/use-store-state) instead.
   * @example
   * const state = store.useState();
   */
  (): S;
  /**
   * Re-renders the component when the state changes and returns the current
   * state given the passed key. Changes on other keys will not trigger a
   * re-render.
   * @param key The state key.
   * @deprecated Use
   * [`useStoreState`](https://ariakit.com/reference/use-store-state) instead.
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
   * @deprecated Use
   * [`useStoreState`](https://ariakit.com/reference/use-store-state) instead.
   * @example
   * const foo = store.useState((state) => state.foo);
   */
  <V>(selector: (state: S) => V): V;
}

type StateStore<T = CoreStore<any>> = T | null | undefined;
type StateKey<T = CoreStore<any>> = keyof StoreState<T>;
type SelectorStateKey<T> = T extends CoreStore ? StateKey<T> : never;
type SelectorState<T, K extends PropertyKey> = T extends CoreStore
  ? Pick<StoreState<T>, Extract<K, StateKey<T>>>
  : never;
type StoreKey = PropertyKey;
type InternalStoreStateObject = Record<string, StoreKey | AnyFunction>;

const noopSubscribe = () => () => {};

function isStoreKeyArray(value: unknown): value is readonly StoreKey[] {
  return Array.isArray(value);
}

function isSameValue(value: unknown, other: unknown) {
  return value === other || (value !== value && other !== other);
}

function hasSameStoreKeys(
  keys: readonly StoreKey[] | null,
  otherKeys: readonly StoreKey[],
) {
  if (keys?.length !== otherKeys.length) return false;
  for (let index = 0; index < keys.length; index += 1) {
    const key = keys[index];
    if (key === undefined) return false;
    if (isSameValue(key, otherKeys[index])) continue;
    return false;
  }
  return true;
}

function useStableStoreKeys<K extends StoreKey>(
  keys: readonly K[] | null,
): K[] | null {
  const keysRef = React.useRef<K[] | null>(null);
  const currentKeys = keysRef.current;

  if (keys === null) {
    keysRef.current = null;
    return null;
  }

  if (hasSameStoreKeys(currentKeys, keys)) {
    return currentKeys;
  }

  const nextKeys = [...keys];
  keysRef.current = nextKeys;
  return nextKeys;
}

/**
 * Receives an Ariakit store object (which can be `null` or `undefined`) and
 * returns the current state. If a key is provided as the second argument, it
 * returns the value of that key. If a selector function is provided, the state
 * is passed to it, and its return value is used. Selector calls can pass the
 * state keys they read as the second argument to skip unrelated store updates.
 * This list must include every store key the selector reads, or the returned
 * snapshot may stay stale. An empty list means store updates will never notify
 * the selector.
 *
 * The component using this hook will re-render when the returned value changes.
 * @example
 * Accessing the whole combobox state:
 * ```js
 * const combobox = Ariakit.useComboboxStore();
 * const state = Ariakit.useStoreState(combobox);
 * ```
 * @example
 * Accessing a specific value from the combobox state:
 * ```js
 * const combobox = Ariakit.useComboboxStore();
 * const value = Ariakit.useStoreState(combobox, "value");
 * ```
 * @example
 * Accessing a value using a selector function:
 * ```js
 * const combobox = Ariakit.useComboboxStore();
 * const value = Ariakit.useStoreState(combobox, (state) => state.value);
 * ```
 * @example
 * Subscribing only to the state keys read by a selector:
 * ```js
 * const tab = Ariakit.useTabStore();
 * const selected = Ariakit.useStoreState(
 *   tab,
 *   ["selectedId"],
 *   (state) => state.selectedId === "details",
 * );
 * ```
 * @example
 * Accessing the state of a store that may be `null` or `undefined` (for
 * example, using a context):
 * ```js
 * const combobox = Ariakit.useComboboxContext();
 * const value = Ariakit.useStoreState(combobox, "value");
 * ```
 */

export function useStoreState<T extends CoreStore>(store: T): StoreState<T>;

export function useStoreState<T extends CoreStore>(
  store: StateStore<T>,
): StoreState<T> | undefined;

export function useStoreState<T extends CoreStore, K extends StateKey<T>>(
  store: T,
  key: K,
): StoreState<T>[K];

export function useStoreState<T extends CoreStore, K extends StateKey<T>>(
  store: StateStore<T>,
  key: K,
): StoreState<T>[K] | undefined;

export function useStoreState<T extends CoreStore, V>(
  store: T,
  selector: (state: StoreState<T>) => V,
): V;

export function useStoreState<T extends CoreStore, V>(
  store: StateStore<T>,
  selector: (state?: StoreState<T>) => V,
): V;

export function useStoreState<
  T extends CoreStore,
  K extends SelectorStateKey<T>,
  V,
>(store: T, keys: readonly K[], selector: (state: SelectorState<T, K>) => V): V;

export function useStoreState<
  T extends CoreStore,
  K extends SelectorStateKey<T>,
  V,
>(
  store: StateStore<T>,
  keys: readonly K[],
  selector: (state?: SelectorState<T, K>) => V,
): V;

export function useStoreState(
  store: StateStore,
  keyOrKeysOrSelector: StoreKey | readonly StoreKey[] | AnyFunction = identity,
  selector?: AnyFunction,
) {
  const keys = isStoreKeyArray(keyOrKeysOrSelector)
    ? keyOrKeysOrSelector
    : typeof keyOrKeysOrSelector === "function"
      ? null
      : [keyOrKeysOrSelector];
  const subscriptionKeys = useStableStoreKeys(keys);

  const storeSubscribe = React.useCallback(
    (callback: () => void) => {
      if (!store) return noopSubscribe();
      if (subscriptionKeys?.length === 0) return noopSubscribe();
      return subscribe(store, subscriptionKeys, callback);
    },
    [store, subscriptionKeys],
  );

  const getSnapshot = () => {
    const state = store?.getState();
    if (isStoreKeyArray(keyOrKeysOrSelector)) {
      return selector?.(state);
    }
    if (typeof keyOrKeysOrSelector === "function") {
      return keyOrKeysOrSelector(state);
    }
    if (!state) return;
    if (!hasOwnProperty(state, keyOrKeysOrSelector)) return;
    return state[keyOrKeysOrSelector];
  };

  return useSyncExternalStore(storeSubscribe, getSnapshot, getSnapshot);
}

type StoreStateObject<T extends StateStore, S> = Record<
  string,
  StateKey<T> | ((state: S) => any)
>;

type StoreStateObjectResult<
  T extends StateStore,
  S extends StoreState<T> | undefined,
  O extends Record<string, StateKey<T> | AnyFunction>,
> = {
  [K in keyof O]: O[K] extends keyof StoreState<T>
    ? O[K] extends keyof S
      ? S[O[K]]
      : StoreState<T>[O[K]] | undefined
    : O[K] extends AnyFunction
      ? ReturnType<O[K]>
      : never;
};

function getStoreStateObjectKeys(
  object: InternalStoreStateObject,
  selectorKeys?: readonly StoreKey[],
) {
  const keys: StoreKey[] = [];
  let hasSelector = false;

  for (const prop in object) {
    const keyOrSelector = object[prop];
    if (keyOrSelector === undefined) continue;
    if (typeof keyOrSelector === "function") {
      hasSelector = true;
      continue;
    }
    if (keys.includes(keyOrSelector)) continue;
    keys.push(keyOrSelector);
  }

  if (!hasSelector) return keys;
  if (!selectorKeys) return null;

  for (const key of selectorKeys) {
    if (keys.includes(key)) continue;
    keys.push(key);
  }

  return keys;
}

/**
 * Receives an Ariakit store object (which can be `null` or `undefined`) and
 * returns the current state. Unlike `useStoreState`, this hook receives an
 * object with keys that map to store keys or selector functions. Store keys in
 * the object are always subscribed to. When selector dependency keys are
 * passed as the second argument, they must include every store key read by
 * every selector, or the returned snapshot may stay stale. An empty list means
 * only direct store keys in the object will notify the selectors.
 * @example
 * Reading direct and derived values with selector dependencies:
 * ```js
 * const values = useStoreStateObject(
 *   store,
 *   ["value"],
 *   {
 *     value: "value",
 *     valueLength: (state) => state.value.length,
 *   },
 * );
 * ```
 */
export function useStoreStateObject<
  T extends CoreStore,
  O extends StoreStateObject<T, StoreState<T>>,
>(store: T, object: O): StoreStateObjectResult<T, StoreState<T>, O>;

export function useStoreStateObject<
  T extends StateStore,
  O extends StoreStateObject<T, StoreState<T> | undefined>,
>(store: T, object: O): StoreStateObjectResult<T, StoreState<T> | undefined, O>;

export function useStoreStateObject<
  T extends CoreStore,
  K extends SelectorStateKey<T>,
  O extends StoreStateObject<T, SelectorState<T, K>>,
>(
  store: T,
  keys: readonly K[],
  object: O,
): StoreStateObjectResult<T, StoreState<T>, O>;

export function useStoreStateObject<
  T extends CoreStore,
  K extends SelectorStateKey<T>,
  O extends StoreStateObject<T, SelectorState<T, K> | undefined>,
>(
  store: StateStore<T>,
  keys: readonly K[],
  object: O,
): StoreStateObjectResult<T, StoreState<T> | undefined, O>;

export function useStoreStateObject(
  store: StateStore,
  objectOrKeys: InternalStoreStateObject | readonly StoreKey[],
  object?: InternalStoreStateObject,
) {
  const stateObject = isStoreKeyArray(objectOrKeys)
    ? (object ?? {})
    : objectOrKeys;
  const selectorKeys = isStoreKeyArray(objectOrKeys) ? objectOrKeys : undefined;
  const objRef = React.useRef(
    {} as StoreStateObjectResult<StateStore, State, any>,
  );
  const subscriptionKeys = useStableStoreKeys(
    getStoreStateObjectKeys(stateObject, selectorKeys),
  );

  const storeSubscribe = React.useCallback(
    (callback: () => void) => {
      if (!store) return noopSubscribe();
      if (subscriptionKeys?.length === 0) return noopSubscribe();
      return subscribe(store, subscriptionKeys, callback);
    },
    [store, subscriptionKeys],
  );

  const getSnapshot = () => {
    const state = store?.getState();
    let updated = false;
    const obj = objRef.current;

    for (const prop in stateObject) {
      const keyOrSelector = stateObject[prop];
      if (keyOrSelector === undefined) continue;

      if (typeof keyOrSelector === "function") {
        const value = keyOrSelector(state);
        // Compare with Object.is, the same comparator useSyncExternalStore
        // uses, so a NaN value doesn't invalidate the snapshot on every call,
        // which would break the getSnapshot idempotency contract and make
        // React loop until it throws "Maximum update depth exceeded". See
        // https://github.com/ariakit/ariakit/issues/6335
        if (!Object.is(value, obj[prop])) {
          obj[prop] = value;
          updated = true;
        }
      }

      if (typeof keyOrSelector === "function") continue;
      const value =
        state && hasOwnProperty(state, keyOrSelector)
          ? state[keyOrSelector]
          : undefined;
      if (!Object.is(value, obj[prop])) {
        obj[prop] = value;
        updated = true;
      }
    }

    if (updated) {
      objRef.current = { ...obj };
    }

    return objRef.current;
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
  P extends Partial<S>,
  K extends keyof S,
  // oxlint-disable-next-line no-unnecessary-type-parameters
  SK extends keyof PickByValue<P, SetState<P[K]>>,
>(store: CoreStore<S>, props: P, key: K, setKey?: SK) {
  const value = hasOwnProperty(props, key) ? props[key] : undefined;
  const setValue = setKey ? props[setKey] : undefined;
  const hasSetValue = !!setValue;
  const propsRef = useLiveRef({ value, setValue });

  // Calls setValue when the state value changes.
  useSafeLayoutEffect(() => {
    if (!hasSetValue) return;
    return subscribe(store, [key], (state, prev) => {
      const { value, setValue } = propsRef.current;
      if (!setValue) return;
      if (isSameValue(state[key], prev[key])) return;
      if (isSameValue(state[key], value)) return;
      setValue(state[key]);
    });
  }, [store, key, hasSetValue]);

  // If the value prop is provided, we'll always reset the store state to it.
  useSafeLayoutEffect(() => {
    if (value === undefined) return;
    store.setState(key, value);
    return batch(store, [key], () => {
      if (value === undefined) return;
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

export type Store<T extends CoreStore = CoreStore> = T & {
  /**
   * Re-renders the component when the state changes and returns the current
   * state.
   * @deprecated Use
   * [`useStoreState`](https://ariakit.com/reference/use-store-state) instead.
   */
  useState: UseState<StoreState<T>>;
};
