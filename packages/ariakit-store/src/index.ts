import {
  omit as _omit,
  pick as _pick,
  applyState,
  chain,
  getKeys,
  hasOwnProperty,
  invariant,
  noop,
} from "@ariakit/utils";
import type { AnyObject, SetStateAction } from "@ariakit/utils";

type Listener<S> = (state: S, prevState: S) => void | (() => void);

type Sync<S, K extends keyof S> = (
  keys: K[] | null,
  listener: Listener<Pick<S, K>>,
) => () => void;

type StoreSetup = (callback: () => void | (() => void)) => () => void;
type StoreInit = () => () => void;
type StoreSubscribe<S = State, K extends keyof S = keyof S> = Sync<S, K>;
type StoreSync<S = State, K extends keyof S = keyof S> = Sync<S, K>;
type StoreBatch<S = State, K extends keyof S = keyof S> = Sync<S, K>;
type StorePick<
  S = State,
  K extends ReadonlyArray<keyof S> = ReadonlyArray<keyof S>,
> = (keys: K) => Store<Pick<S, K[number]>>;
type StoreOmit<
  S = State,
  K extends ReadonlyArray<keyof S> = ReadonlyArray<keyof S>,
> = (keys: K) => Store<Omit<S, K[number]>>;
type ListenerMap<S> = Map<keyof S, Set<Listener<S>>>;
type UpdatedKey<S> = keyof S | Set<keyof S>;

interface ListenerGroup<S> {
  listeners: Set<Listener<S>>;
  listenersByKey?: ListenerMap<S>;
  allKeysListeners?: Set<Listener<S>>;
}

interface StoreInternals<S = State> {
  setup: StoreSetup;
  init: StoreInit;
  subscribe: StoreSubscribe<S>;
  sync: StoreSync<S>;
  batch: StoreBatch<S>;
  pick: StorePick<S>;
  omit: StoreOmit<S>;
}

function getInternal<K extends keyof StoreInternals>(
  store: Store & { __unstableInternals?: StoreInternals },
  key: K,
): StoreInternals[K] {
  const internals = store.__unstableInternals;
  invariant(internals, "Invalid store");
  return internals[key];
}

function hasUpdatedKey<S>(
  keys: Array<keyof S> | null | undefined,
  updatedKey: UpdatedKey<S>,
) {
  if (!keys) return true;
  for (const currentKey of keys) {
    if (updatedKey instanceof Set) {
      if (updatedKey.has(currentKey)) return true;
    } else if (currentKey === updatedKey) {
      return true;
    }
  }
  return false;
}

function addKeyedListener<S>(
  map: ListenerMap<S>,
  keys: Array<keyof S> | null,
  listener: Listener<S>,
) {
  if (!keys) return;
  for (const key of keys) {
    let listeners = map.get(key);
    if (!listeners) {
      listeners = new Set();
      map.set(key, listeners);
    }
    listeners.add(listener);
  }
}

function deleteKeyedListener<S>(
  map: ListenerMap<S> | undefined,
  keys: Array<keyof S> | null | undefined,
  listener: Listener<S>,
) {
  if (!map) return;
  if (!keys) return;
  for (const key of keys) {
    const listeners = map.get(key);
    if (!listeners) continue;
    listeners.delete(listener);
    if (!listeners.size) {
      map.delete(key);
    }
  }
}

/**
 * Creates a store.
 * @param initialState Initial state.
 * @param stores Stores to extend.
 */
export function createStore<S extends State>(
  initialState: S,
  ...stores: Array<Store<Partial<S>> | undefined>
): Store<S> {
  let state = initialState;
  let prevStateBatch = state;
  let lastUpdate = 0;
  let destroy = noop;
  const instances = new Set<symbol>();
  const updatedKeys = new Set<keyof S>();

  const setups = new Set<() => void | (() => void)>();
  const syncListeners: ListenerGroup<S> = { listeners: new Set() };
  const batchListenerGroup: ListenerGroup<S> = { listeners: new Set() };
  const disposables = new WeakMap<Listener<S>, void | (() => void)>();
  const listenerKeys = new WeakMap<Listener<S>, Array<keyof S> | null>();

  const storeSetup: StoreSetup = (callback) => {
    setups.add(callback);
    return () => setups.delete(callback);
  };

  const storeInit: StoreInit = () => {
    // Make sure we only initialize the store once, even when it's passed to
    // other stores. However, the store can't be destroyed until all instances
    // are unmounted. See https://github.com/ariakit/ariakit/issues/3147. See
    // select-default-open-controlled tests.
    const initialized = instances.size;
    const instance = Symbol();
    instances.add(instance);

    const maybeDestroy = () => {
      instances.delete(instance);
      if (instances.size) return;
      destroy();
    };

    if (initialized) return maybeDestroy;

    const stateKeys = getKeys(state);
    const desyncs: Array<void | (() => void)> = [];
    for (const store of stores) {
      const storeState = store?.getState?.();
      if (!storeState) continue;
      const keys = stateKeys.filter((key) => hasOwnProperty(storeState, key));
      if (!keys.length) continue;
      const shouldSyncByKey =
        stores.length === 1 || keys.length === stateKeys.length;
      if (shouldSyncByKey) {
        for (const key of keys) {
          desyncs.push(
            sync(store, [key], (state) => {
              setState(
                key,
                state[key],
                // @ts-expect-error - Not public API. This is just to prevent
                // infinite loops.
                true,
              );
            }),
          );
        }
        continue;
      }
      let initialized = false;
      desyncs.push(
        sync(store, keys, (state, prevState) => {
          for (const key of keys) {
            if (initialized && state[key] === prevState[key]) continue;
            setState(
              key,
              state[key],
              // @ts-expect-error - Not public API. This is just to prevent
              // infinite loops.
              true,
            );
          }
          initialized = true;
        }),
      );
    }

    const teardowns: Array<void | (() => void)> = [];
    for (const setup of setups) {
      teardowns.push(setup());
    }

    const cleanups = stores.map(init);

    destroy = chain(...desyncs, ...teardowns, ...cleanups);

    return maybeDestroy;
  };

  const deleteListenerIndexes = (
    group: ListenerGroup<S>,
    listener: Listener<S>,
    keys: Array<keyof S> | null | undefined,
  ) => {
    if (keys === undefined) return;
    if (keys) {
      deleteKeyedListener(group.listenersByKey, keys, listener);
    } else {
      group.allKeysListeners?.delete(listener);
    }
  };

  const sub = (
    keys: Array<keyof S> | null,
    listener: Listener<S>,
    group = syncListeners,
  ) => {
    const listenerKeysValue = keys ? [...keys] : null;
    if (group.listeners.has(listener)) {
      deleteListenerIndexes(group, listener, listenerKeys.get(listener));
    }
    group.listeners.add(listener);
    if (listenerKeysValue) {
      group.listenersByKey ??= new Map();
      addKeyedListener(group.listenersByKey, listenerKeysValue, listener);
    } else {
      group.allKeysListeners ??= new Set();
      group.allKeysListeners.add(listener);
    }
    listenerKeys.set(listener, listenerKeysValue);
    return () => {
      disposables.get(listener)?.();
      disposables.delete(listener);
      const currentKeys = listenerKeys.get(listener);
      deleteListenerIndexes(group, listener, listenerKeysValue);
      if (currentKeys !== listenerKeysValue) {
        deleteListenerIndexes(group, listener, currentKeys);
      }
      listenerKeys.delete(listener);
      group.listeners.delete(listener);
    };
  };

  const storeSubscribe: StoreSubscribe<S> = (keys, listener) =>
    sub(keys, listener);

  const storeSync: StoreSync<S> = (keys, listener) => {
    disposables.set(listener, listener(state, state));
    return sub(keys, listener);
  };

  const storeBatch: StoreBatch<S> = (keys, listener) => {
    disposables.set(listener, listener(state, prevStateBatch));
    return sub(keys, listener, batchListenerGroup);
  };

  const storePick: StorePick<S, ReadonlyArray<keyof S>> = (keys) =>
    createStore(_pick(state, keys), finalStore);

  const storeOmit: StoreOmit<S, ReadonlyArray<keyof S>> = (keys) =>
    createStore(_omit(state, keys), finalStore);

  const getState: Store<S>["getState"] = () => state;

  const run = (listener: Listener<S>, prev: S) => {
    disposables.get(listener)?.();
    disposables.set(listener, listener(state, prev));
  };

  const runIfNeeded = (
    listener: Listener<S>,
    prevState: S,
    updatedKey: UpdatedKey<S>,
  ) => {
    const keys = listenerKeys.get(listener);
    if (!hasUpdatedKey(keys, updatedKey)) return;
    run(listener, prevState);
  };

  const runListeners = (
    group: ListenerGroup<S>,
    prevState: S,
    updatedKey: UpdatedKey<S>,
  ) => {
    if (!(updatedKey instanceof Set) && !group.allKeysListeners?.size) {
      const keyedListeners = group.listenersByKey?.get(updatedKey);
      if (!keyedListeners) return;
      for (const listener of keyedListeners) {
        if (!group.listeners.has(listener)) continue;
        run(listener, prevState);
      }
      return;
    }
    for (const listener of group.listeners) {
      runIfNeeded(listener, prevState, updatedKey);
    }
  };

  const setState: Store<S>["setState"] = (key, value, fromStores = false) => {
    if (!hasOwnProperty(state, key)) return;

    const nextValue = applyState(value, state[key]);

    if (nextValue === state[key]) return;

    if (!fromStores) {
      for (const store of stores) {
        store?.setState?.(key, nextValue);
      }
    }

    const prevState = state;
    state = { ...state, [key]: nextValue };

    lastUpdate += 1;
    const thisUpdate = lastUpdate;
    updatedKeys.add(key);

    runListeners(syncListeners, prevState, key);

    queueMicrotask(() => {
      // If setState is called again before this microtask runs, skip this
      // update. This is to prevent unnecessary updates when multiple keys are
      // updated in a single microtask.
      if (lastUpdate !== thisUpdate) return;
      // Take snapshots before running batch listeners. This is necessary
      // because batch listeners can setState.
      const snapshot = state;
      const updatedKeysSnapshot = new Set(updatedKeys);
      updatedKeys.clear();
      runListeners(batchListenerGroup, prevStateBatch, updatedKeysSnapshot);
      prevStateBatch = snapshot;
    });
  };

  const finalStore = {
    getState,
    setState,
    __unstableInternals: {
      setup: storeSetup,
      init: storeInit,
      subscribe: storeSubscribe,
      sync: storeSync,
      batch: storeBatch,
      pick: storePick,
      omit: storeOmit,
    },
  };

  return finalStore;
}

export function setup<T extends Store>(
  store?: T | null,
  ...args: Parameters<StoreSetup>
): T extends Store ? ReturnType<StoreSetup> : void;

/**
 * Register a callback function that's called when the store is initialized.
 */
export function setup(store?: Store, ...args: Parameters<StoreSetup>) {
  if (!store) return;
  return getInternal(store, "setup")(...args);
}

export function init<T extends Store>(
  store?: T | null,
  ...args: Parameters<StoreInit>
): T extends Store ? ReturnType<StoreInit> : void;

/**
 * Function that should be called when the store is initialized.
 */
export function init(store?: Store, ...args: Parameters<StoreInit>) {
  if (!store) return;
  return getInternal(store, "init")(...args);
}

export function subscribe<T extends Store, K extends keyof StoreState<T>>(
  store?: T | null,
  ...args: Parameters<StoreSubscribe<StoreState<T>, K>>
): T extends Store ? ReturnType<StoreSubscribe<StoreState<T>, K>> : void;

/**
 * Registers a listener function that's called after state changes in the store.
 */
export function subscribe(store?: Store, ...args: Parameters<StoreSubscribe>) {
  if (!store) return;
  return getInternal(store, "subscribe")(...args);
}

export function sync<T extends Store, K extends keyof StoreState<T>>(
  store?: T | null,
  ...args: Parameters<StoreSync<StoreState<T>, K>>
): T extends Store ? ReturnType<StoreSync<StoreState<T>, K>> : void;

/**
 * Registers a listener function that's called immediately and synchronously
 * whenever the store state changes.
 */
export function sync(store?: Store, ...args: Parameters<StoreSync>) {
  if (!store) return;
  return getInternal(store, "sync")(...args);
}

export function batch<T extends Store, K extends keyof StoreState<T>>(
  store?: T | null,
  ...args: Parameters<StoreBatch<StoreState<T>, K>>
): T extends Store ? ReturnType<StoreBatch<StoreState<T>, K>> : void;

/**
 * Registers a listener function that's called immediately and after a batch
 * of state changes in the store.
 */
export function batch(store?: Store, ...args: Parameters<StoreBatch>) {
  if (!store) return;
  return getInternal(store, "batch")(...args);
}

export function omit<
  T extends Store,
  K extends ReadonlyArray<keyof StoreState<T>>,
>(
  store?: T | null,
  ...args: Parameters<StoreOmit<StoreState<T>, K>>
): T extends Store ? ReturnType<StoreOmit<StoreState<T>, K>> : void;

/**
 * Creates a new store with a subset of the current store state and keeps them
 * in sync.
 */
export function omit(store?: Store, ...args: Parameters<StoreOmit>) {
  if (!store) return;
  return getInternal(store, "omit")(...args);
}

export function pick<
  T extends Store,
  K extends ReadonlyArray<keyof StoreState<T>>,
>(
  store?: T | null,
  ...args: Parameters<StorePick<StoreState<T>, K>>
): T extends Store ? ReturnType<StorePick<StoreState<T>, K>> : void;

/**
 * Creates a new store with a subset of the current store state and keeps them
 * in sync.
 */
export function pick(store: Store, ...args: Parameters<StorePick>) {
  if (!store) return;
  return getInternal(store, "pick")(...args);
}

/**
 * Merges multiple stores into a single store.
 */
export function mergeStore<S extends State>(
  ...stores: Array<Store<S> | undefined>
): Store<S> {
  const initialState = {} as S;
  for (const store of stores) {
    const nextState = store?.getState?.();
    if (nextState) {
      Object.assign(initialState, nextState);
    }
  }
  const store = createStore(initialState, ...stores);
  return Object.assign({}, ...stores, store);
}

/**
 * Throws when a store prop is passed in conjunction with a default state.
 */
export function throwOnConflictingProps(props: AnyObject, store?: Store) {
  if (process.env.NODE_ENV === "production") return;
  if (!store) return;
  const defaultKeys = Object.entries(props)
    .filter(([key, value]) => key.startsWith("default") && value !== undefined)
    .map(([key]) => {
      const stateKey = key.replace("default", "");
      return `${stateKey[0]?.toLowerCase() || ""}${stateKey.slice(1)}`;
    });
  if (!defaultKeys.length) return;
  const storeState = store.getState();
  const conflictingProps = defaultKeys.filter((key) =>
    hasOwnProperty(storeState, key),
  );
  if (!conflictingProps.length) return;
  throw new Error(
    `Passing a store prop in conjunction with a default state is not supported.

const store = useSelectStore();
<SelectProvider store={store} defaultValue="Apple" />
                ^             ^

Instead, pass the default state to the topmost store:

const store = useSelectStore({ defaultValue: "Apple" });
<SelectProvider store={store} />

See https://github.com/ariakit/ariakit/pull/2745 for more details.

If there's a particular need for this, please submit a feature request at https://github.com/ariakit/ariakit
`,
  );
}

/**
 * Store state type.
 */
export type State = AnyObject;

/**
 * Initial state that can be passed to a store creator function.
 * @template S State type.
 * @template K Key type.
 */
export type StoreOptions<S extends State, K extends keyof S> = Partial<
  Pick<S, K>
>;

/**
 * Props that can be passed to a store creator function.
 * @template S State type.
 */
export interface StoreProps<S extends State = State> {
  /**
   * Another store object that will be kept in sync with the original store.
   *
   * Live examples:
   * - [Navigation Menubar](https://ariakit.com/examples/menubar-navigation)
   */
  store?: Store<Partial<S>>;
}

/**
 * Extracts the state type from a store type.
 * @template T Store type.
 */
export type StoreState<T> = T extends Store<infer S> ? S : never;

/**
 * Store.
 * @template S State type.
 */
export interface Store<S = State> {
  /**
   * Returns the current store state.
   */
  getState(): S;
  /**
   * Sets a state value.
   */
  setState<K extends keyof S>(key: K, value: SetStateAction<S[K]>): void;
}
