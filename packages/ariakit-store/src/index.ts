import {
  omit as _omit,
  pick as _pick,
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

type ParentSyncListener<S> = (state: S, updatedKey: keyof S | null) => void;
type ParentSync<S> = (
  keys: Array<keyof S>,
  listener: ParentSyncListener<S>,
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
type ParentSyncMap<S> = Map<keyof S, Set<ParentSyncListener<S>>>;
type UpdatedKey<S> = keyof S | Set<keyof S>;

interface ListenerGroup<S> {
  listeners: Set<Listener<S>>;
  listenersByKey?: ListenerMap<S>;
  allKeysListeners?: Set<Listener<S>>;
  disposables: Map<Listener<S>, () => void>;
  listenerKeys: WeakMap<Listener<S>, Array<keyof S> | null>;
}

interface StoreInternals<S = State> {
  setup: StoreSetup;
  init: StoreInit;
  subscribe: StoreSubscribe<S>;
  sync: StoreSync<S>;
  batch: StoreBatch<S>;
  pick: StorePick<S>;
  omit: StoreOmit<S>;
  parentSync: ParentSync<S>;
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
  let destroy = noop;
  let batchPending = false;
  let inDispatch = false;
  let updatedKeys = new Set<keyof S>();
  const instances = new Set<symbol>();

  const setups = new Set<() => void | (() => void)>();
  const syncListeners: ListenerGroup<S> = {
    listeners: new Set(),
    disposables: new Map(),
    listenerKeys: new WeakMap(),
  };
  const batchListenerGroup: ListenerGroup<S> = {
    listeners: new Set(),
    disposables: new Map(),
    listenerKeys: new WeakMap(),
  };
  // Per-key fan-out for child stores that extend this one. Stays undefined
  // until a child store registers a parent-sync listener so isolated stores
  // pay no extra cost on every setState.
  let parentSyncByKey: ParentSyncMap<S> | undefined;

  const storeSetup: StoreSetup = (callback) => {
    setups.add(callback);
    return () => setups.delete(callback);
  };

  const storeInit: StoreInit = () => {
    // Make sure we only initialize the store once, even when it's passed to
    // other stores. However, the store can't be destroyed until all instances
    // are unmounted. See https://github.com/ariakit/ariakit/issues/3147. See
    // select-default-open-controlled tests.
    const initializedInstances = instances.size;
    const instance = Symbol();
    instances.add(instance);

    const maybeDestroy = () => {
      instances.delete(instance);
      if (instances.size) return;
      destroy();
    };

    if (initializedInstances) return maybeDestroy;

    const stateKeys = getKeys(state);
    const desyncs: Array<void | (() => void)> = [];
    for (const store of stores) {
      if (!store) continue;
      const storeState = store.getState?.();
      if (!storeState) continue;
      const keys = stateKeys.filter((key) => hasOwnProperty(storeState, key));
      if (!keys.length) continue;
      const parentSync = getInternal(store, "parentSync") as ParentSync<S>;
      desyncs.push(
        parentSync(keys, (parentState, updatedKey) => {
          if (updatedKey === null) {
            // Initial registration: push every parent key into the child so
            // this parent's values take precedence in argument order. Re-read
            // the parent's state per key to mirror the original per-key sync
            // behavior, where a reentrant setState earlier in the loop could
            // observe the updated parent state on the next iteration.
            for (const key of keys) {
              setState(
                key,
                store.getState()[key],
                // @ts-expect-error - Not public API. This is just to prevent
                // infinite loops.
                true,
              );
            }
            return;
          }
          // Update: propagate only the changed key.
          setState(
            updatedKey,
            parentState[updatedKey],
            // @ts-expect-error - Not public API. This is just to prevent
            // infinite loops.
            true,
          );
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
      deleteListenerIndexes(group, listener, group.listenerKeys.get(listener));
    }
    group.listeners.add(listener);
    if (listenerKeysValue) {
      group.listenersByKey ??= new Map();
      addKeyedListener(group.listenersByKey, listenerKeysValue, listener);
    } else {
      group.allKeysListeners ??= new Set();
      group.allKeysListeners.add(listener);
    }
    group.listenerKeys.set(listener, listenerKeysValue);
    return () => {
      group.disposables.get(listener)?.();
      group.disposables.delete(listener);
      const currentKeys = group.listenerKeys.get(listener);
      deleteListenerIndexes(group, listener, listenerKeysValue);
      if (currentKeys !== listenerKeysValue) {
        deleteListenerIndexes(group, listener, currentKeys);
      }
      group.listenerKeys.delete(listener);
      group.listeners.delete(listener);
    };
  };

  const storeSubscribe: StoreSubscribe<S> = (keys, listener) =>
    sub(keys, listener);

  const storeSync: StoreSync<S> = (keys, listener) => {
    const cleanup = listener(state, state);
    // Always reconcile the disposables entry. Skipping the delete when the
    // listener returned no cleanup would leave a stale cleanup from a
    // previous registration of the same listener in place.
    if (cleanup) {
      syncListeners.disposables.set(listener, cleanup);
    } else {
      syncListeners.disposables.delete(listener);
    }
    return sub(keys, listener);
  };

  const storeBatch: StoreBatch<S> = (keys, listener) => {
    // When the first batch listener is registered while the store is idle,
    // refresh prevStateBatch to the current state. setState skips updating
    // prevStateBatch while no batch listeners exist, so this avoids leaking
    // stale state into the new listener. During an active dispatch, leave
    // prevStateBatch alone so the upcoming microtask flush still reports the
    // current setState's diff to the newly registered listener.
    if (!batchListenerGroup.listeners.size && !inDispatch) {
      prevStateBatch = state;
    }
    const cleanup = listener(state, prevStateBatch);
    if (cleanup) {
      batchListenerGroup.disposables.set(listener, cleanup);
    } else {
      batchListenerGroup.disposables.delete(listener);
    }
    return sub(keys, listener, batchListenerGroup);
  };

  // Internal, init-only counterpart to `sync` for parent → child propagation.
  // Registering once with N keys is dramatically cheaper than N separate
  // `sync` calls, and dispatch stays O(1) per setState because the listener
  // is told which key changed.
  const storeParentSync: ParentSync<S> = (keys, listener) => {
    parentSyncByKey ??= new Map();
    // Register before firing the initial sync. The original per-key `sync`
    // implementation registered each key before pushing the next, so a child
    // listener that reentrantly mutated an already-pushed parent key would
    // see the update propagate back. With a single registration after the
    // initial fire, those reentrant updates would be lost.
    for (const key of keys) {
      let listeners = parentSyncByKey.get(key);
      if (!listeners) {
        listeners = new Set();
        parentSyncByKey.set(key, listeners);
      }
      listeners.add(listener);
    }
    // Fire once on registration so the child can mirror the parent's current
    // values. `updatedKey` is null to signal the initial sync.
    listener(state, null);
    return () => {
      if (!parentSyncByKey) return;
      for (const key of keys) {
        const listeners = parentSyncByKey.get(key);
        if (!listeners) continue;
        listeners.delete(listener);
        if (!listeners.size) parentSyncByKey.delete(key);
      }
      if (!parentSyncByKey.size) parentSyncByKey = undefined;
    };
  };

  const storePick: StorePick<S, ReadonlyArray<keyof S>> = (keys) =>
    createStore(_pick(state, keys), finalStore);

  const storeOmit: StoreOmit<S, ReadonlyArray<keyof S>> = (keys) =>
    createStore(_omit(state, keys), finalStore);

  const getState: Store<S>["getState"] = () => state;

  const runListeners = (
    group: ListenerGroup<S>,
    prevState: S,
    updatedKey: UpdatedKey<S>,
  ) => {
    const { disposables } = group;
    if (!(updatedKey instanceof Set) && !group.allKeysListeners?.size) {
      const keyedListeners = group.listenersByKey?.get(updatedKey);
      if (!keyedListeners) return;
      for (const listener of keyedListeners) {
        // Skip the cleanup lookup when no listener has registered a cleanup.
        const cleanup = disposables.size && disposables.get(listener);
        if (cleanup) cleanup();
        const result = listener(state, prevState);
        if (result) {
          disposables.set(listener, result);
        } else if (cleanup) {
          disposables.delete(listener);
        }
      }
      return;
    }
    const allKeysListeners = group.allKeysListeners;
    if (allKeysListeners && allKeysListeners.size === group.listeners.size) {
      // Fast path: every listener is an all-keys listener, no keys to check.
      // Listeners re-keyed to a non-null key during this iteration are dropped
      // from allKeysListeners and therefore skipped for the current update;
      // they fire normally on subsequent setStates.
      for (const listener of allKeysListeners) {
        const cleanup = disposables.size && disposables.get(listener);
        if (cleanup) cleanup();
        const result = listener(state, prevState);
        if (result) {
          disposables.set(listener, result);
        } else if (cleanup) {
          disposables.delete(listener);
        }
      }
      return;
    }
    for (const listener of group.listeners) {
      if (!allKeysListeners?.has(listener)) {
        const keys = group.listenerKeys.get(listener);
        if (!hasUpdatedKey(keys, updatedKey)) continue;
      }
      const cleanup = disposables.size && disposables.get(listener);
      if (cleanup) cleanup();
      const result = listener(state, prevState);
      if (result) {
        disposables.set(listener, result);
      } else if (cleanup) {
        disposables.delete(listener);
      }
    }
  };

  const setState: Store<S>["setState"] = (key, value, fromStores = false) => {
    if (!hasOwnProperty(state, key)) return;

    const currentValue = state[key];
    const nextValue =
      typeof value === "function"
        ? (value as (current: S[typeof key]) => S[typeof key])(currentValue)
        : value;

    if (nextValue === currentValue) return;

    if (!fromStores && stores.length) {
      for (const store of stores) {
        store?.setState?.(key, nextValue);
      }
    }

    const prevState = state;
    state = { ...state, [key]: nextValue };

    // Track the active dispatch so storeBatch can distinguish idle
    // registration (refresh prevStateBatch) from registration during an
    // in-flight setState (keep prevStateBatch so the upcoming microtask
    // reports the correct diff).
    const wasInDispatch = inDispatch;
    inDispatch = true;
    try {
      runListeners(syncListeners, prevState, key);

      // Direct fan-out to child stores extending this one. Each parentSync
      // listener receives the changed key and forwards the value to the
      // child's setState in O(1).
      const parentSyncs = parentSyncByKey?.get(key);
      if (parentSyncs) {
        for (const listener of parentSyncs) {
          listener(state, key);
        }
      }
    } finally {
      inDispatch = wasInDispatch;
    }

    // Skip the microtask when no batch listeners are registered. Their
    // bookkeeping (microtask, updatedKeys) is only observable through batch
    // listeners. Still keep prevStateBatch in sync with the current state at
    // the end of every outermost setState so a future batch listener — whether
    // registered idle or mid-dispatch during a later setState — observes the
    // correct previous state. A reentrant setState leaves prevStateBatch
    // alone so the outer setState's snapshot remains intact for batch
    // listeners registered inside its dispatch.
    if (!batchListenerGroup.listeners.size) {
      if (!inDispatch) prevStateBatch = state;
      return;
    }

    updatedKeys.add(key);

    // Coalesce multiple setStates in the same microtask via a pending flag.
    // Any setStates queued before the microtask runs share the same flush.
    if (batchPending) return;
    batchPending = true;
    queueMicrotask(() => {
      batchPending = false;
      // Take snapshots before running batch listeners. This is necessary
      // because batch listeners can setState reentrantly: swapping the Set
      // ensures reentrant updates land in a fresh set that flushes in a new
      // microtask.
      const snapshot = state;
      const updatedKeysSnapshot = updatedKeys;
      updatedKeys = new Set();
      const prevStateBatchBefore = prevStateBatch;
      runListeners(
        batchListenerGroup,
        prevStateBatchBefore,
        updatedKeysSnapshot,
      );
      // Anchor the next batch period to the pre-flush snapshot so surviving
      // listeners see the diff "since the start of the last flush". When the
      // flush already updated prevStateBatch through other paths — a
      // reentrant setState's early-return refresh, or storeBatch refreshing
      // on a successor listener — leave that fresher value in place rather
      // than overwriting it with the stale snapshot.
      if (prevStateBatch === prevStateBatchBefore) {
        prevStateBatch = snapshot;
      }
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
      parentSync: storeParentSync,
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
