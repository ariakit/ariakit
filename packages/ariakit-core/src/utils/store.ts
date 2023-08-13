import {
  omit as _omit,
  pick as _pick,
  applyState,
  chain,
  getKeys,
  hasOwnProperty,
  invariant,
  noop,
} from "./misc.js";
import type { AnyObject, SetStateAction } from "./types.js";

type StoreSetup = (callback: () => void | (() => void)) => () => void;
type StoreInit = () => () => void;
type StoreSubscribe<S = State> = Sync<S>;
type StoreSync<S = State> = Sync<S>;
type StoreBatch<S = State> = Sync<S>;
type StorePick<
  S = State,
  K extends ReadonlyArray<keyof S> = ReadonlyArray<keyof S>,
> = (keys: K) => Store<Pick<S, K[number]>>;
type StoreOmit<
  S = State,
  K extends ReadonlyArray<keyof S> = ReadonlyArray<keyof S>,
> = (keys: K) => Store<Omit<S, K[number]>>;

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
  let lastUpdate = Symbol();
  let initialized = false;
  const updatedKeys = new Set<keyof S>();

  const setups = new Set<() => void | (() => void)>();
  const listeners = new Set<Listener<S>>();
  const listenersBatch = new Set<Listener<S>>();
  const disposables = new WeakMap<Listener<S>, void | (() => void)>();
  const listenerKeys = new WeakMap<Listener<S>, Array<keyof S> | null>();

  const storeSetup: StoreSetup = (callback) => {
    setups.add(callback);
    return () => setups.delete(callback);
  };

  const storeInit: StoreInit = () => {
    if (initialized) return noop;
    if (!stores.length) return noop;
    initialized = true;

    const desyncs = getKeys(state).map((key) =>
      chain(
        ...stores.map((store) => {
          const storeState = store?.getState?.();
          if (!storeState) return;
          if (!hasOwnProperty(storeState, key)) return;
          return sync(store, [key], (state) => setState(key, state[key]!));
        }),
      ),
    );

    const teardowns: Array<void | (() => void)> = [];
    setups.forEach((setup) => teardowns.push(setup()));

    const cleanups = stores.map(init);

    return chain(...desyncs, ...teardowns, ...cleanups, () => {
      initialized = false;
    });
  };

  const sub = (
    keys: Array<keyof S> | null,
    listener: Listener<S>,
    batch = false,
  ) => {
    const set = batch ? listenersBatch : listeners;
    set.add(listener);
    listenerKeys.set(listener, keys);
    return () => {
      disposables.get(listener)?.();
      disposables.delete(listener);
      listenerKeys.delete(listener);
      set.delete(listener);
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
    return sub(keys, listener, true);
  };

  const storePick: StorePick<S, ReadonlyArray<keyof S>> = (keys) =>
    createStore(_pick(state, keys), finalStore);

  const storeOmit: StoreOmit<S, ReadonlyArray<keyof S>> = (keys) =>
    createStore(_omit(state, keys), finalStore);

  const getState: Store<S>["getState"] = () => state;

  const setState: Store<S>["setState"] = (key, value) => {
    if (!hasOwnProperty(state, key)) return;

    const nextValue = applyState(value, state[key]);

    if (nextValue === state[key]) return;

    stores.forEach((store) => {
      store?.setState?.(key, nextValue);
    });

    const prevState = state;
    state = { ...state, [key]: nextValue };

    const thisUpdate = Symbol();
    lastUpdate = thisUpdate;
    updatedKeys.add(key);

    const run = (listener: Listener<S>, prev: S, uKeys?: Set<keyof S>) => {
      const keys = listenerKeys.get(listener);
      const updated = (k: keyof S) => (uKeys ? uKeys.has(k) : k === key);
      if (!keys || keys.some(updated)) {
        disposables.get(listener)?.();
        disposables.set(listener, listener(state, prev));
      }
    };

    listeners.forEach((listener) => run(listener, prevState));

    queueMicrotask(() => {
      // If setState is called again before this microtask runs, skip this
      // update. This is to prevent unnecessary updates when multiple keys are
      // updated in a single microtask.
      if (lastUpdate !== thisUpdate) return;
      // Take a snapshot of the state before running batch listeners. This is
      // necessary because batch listeners can setState.
      const snapshot = state;
      listenersBatch.forEach((listener) => {
        run(listener, prevStateBatch, updatedKeys);
      });
      prevStateBatch = snapshot;
      updatedKeys.clear();
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
  store?: T,
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
  store?: T,
  ...args: Parameters<StoreInit>
): T extends Store ? ReturnType<StoreInit> : void;

/**
 * Function that should be called when the store is initialized.
 */
export function init(store?: Store, ...args: Parameters<StoreInit>) {
  if (!store) return;
  return getInternal(store, "init")(...args);
}

export function subscribe<T extends Store>(
  store?: T,
  ...args: Parameters<StoreSubscribe<StoreState<T>>>
): T extends Store ? ReturnType<StoreSubscribe<StoreState<T>>> : void;

/**
 * Registers a listener function that's called after state changes in the store.
 */
export function subscribe(store?: Store, ...args: Parameters<StoreSubscribe>) {
  if (!store) return;
  return getInternal(store, "subscribe")(...args);
}

export function sync<T extends Store>(
  store?: T,
  ...args: Parameters<StoreSync<StoreState<T>>>
): T extends Store ? ReturnType<StoreSync<StoreState<T>>> : void;

/**
 * Registers a listener function that's called immediately and synchronously
 * whenever the store state changes.
 */
export function sync(store?: Store, ...args: Parameters<StoreSync>) {
  if (!store) return;
  return getInternal(store, "sync")(...args);
}

export function batch<T extends Store>(
  store?: T,
  ...args: Parameters<StoreBatch<StoreState<T>>>
): T extends Store ? ReturnType<StoreBatch<StoreState<T>>> : void;

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
  store?: T,
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
  store?: T,
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
  const initialState = stores.reduce((state, store) => {
    const nextState = store?.getState?.();
    if (!nextState) return state;
    return { ...state, ...nextState };
  }, {} as S);
  const store = createStore(initialState, ...stores);
  return store;
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
export type StoreProps<S extends State = State> = { store?: Store<Partial<S>> };

/**
 * Extracts the state type from a store type.
 * @template T Store type.
 */
export type StoreState<T> = T extends { getState(): infer S } ? S : never;

/**
 * Store listener type.
 * @template S State type.
 */
export type Listener<S> = (state: S, prevState: S) => void | (() => void);

/**
 * Subscriber function type used by `sync`, `subscribe` and `effect`.
 * @template S State type.
 */
export type Sync<S = State> = {
  /**
   * @param listener The listener function. It's called with the current state
   * and the previous state as arguments and may return a cleanup function.
   * @param keys Optional array of state keys to listen to.
   */
  <K extends keyof S = keyof S>(
    keys: K[] | null,
    listener: Listener<Pick<S, K>>,
  ): () => void;
};

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
