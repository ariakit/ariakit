import {
  omit as _omit,
  pick as _pick,
  applyState,
  chain,
  getKeys,
  hasOwnProperty,
  noop,
} from "./misc.js";
import type { AnyObject, SetStateAction } from "./types.js";

/**
 * Creates a store.
 * @param initialState Initial state.
 * @param stores Stores to extend.
 */
export function createStore<S extends State>(
  initialState: S,
  ...stores: Array<Partial<Store<Partial<S>>> | undefined>
): Store<S> {
  let state = initialState;
  let prevStateBatch = state;
  let lastUpdate = Symbol();
  let updating = false;
  let initialized = false;
  const updatedKeys = new Set<keyof S>();

  const setups = new Set<() => void | (() => void)>();
  const listeners = new Set<Listener<S>>();
  const listenersBatch = new Set<Listener<S>>();
  const disposables = new WeakMap<Listener<S>, void | (() => void)>();
  const listenerKeys = new WeakMap<Listener<S>, Array<keyof S> | undefined>();

  const setup: Store<S>["setup"] = (callback) => {
    setups.add(callback);
    return () => setups.delete(callback);
  };

  const init: Store<S>["init"] = () => {
    if (initialized) return noop;
    if (!stores.length) return noop;
    initialized = true;

    const desyncs = getKeys(state).map((key) =>
      chain(
        ...stores.map((store) => {
          const storeState = store?.getState?.();
          if (!storeState) return;
          if (!hasOwnProperty(storeState, key)) return;
          return store?.sync?.((state) => setState(key, state[key]!), [key]);
        })
      )
    );

    const teardowns: Array<void | (() => void)> = [];
    setups.forEach((setup) => teardowns.push(setup()));

    const cleanups = stores.map((store) => store?.init?.());

    return chain(...desyncs, ...teardowns, ...cleanups, () => {
      initialized = false;
    });
  };

  const sub = (listener: Listener<S>, keys?: Array<keyof S>, batch = false) => {
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

  const subscribe: Store<S>["subscribe"] = (listener, keys) =>
    sub(listener, keys);

  const sync: Store<S>["sync"] = (listener, keys) => {
    disposables.set(listener, listener(state, state));
    return sub(listener, keys);
  };

  const syncBatch: Store<S>["syncBatch"] = (listener, keys) => {
    if (!updating) {
      disposables.set(listener, listener(state, prevStateBatch));
    }
    return sub(listener, keys, true);
  };

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
    updating = true;
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
      updating = false;
      // Take a snapshot of the state before running batch listeners. This is
      // necessary because batch listeners can setState.
      const snapshot = state;
      listenersBatch.forEach((listener) => {
        run(listener, prevStateBatch, updatedKeys);
      });
      prevStateBatch = snapshot;
      queueMicrotask(() => {
        // Listeners may call setState again. If we don't clear the updated keys
        // in a microtask, we may end up clearing keys right before the nested
        // setState listeners.
        updatedKeys.clear();
      });
    });
  };

  const pick: Store<S>["pick"] = (...keys) =>
    createStore(_pick(state, keys), finalStore);

  const omit: Store<S>["omit"] = (...keys) =>
    createStore(_omit(state, keys), finalStore);

  const finalStore = {
    setup,
    init,
    subscribe,
    sync,
    syncBatch,
    getState,
    setState,
    pick,
    omit,
  };

  return finalStore;
}

/**
 * Merges multiple stores into a single store.
 */
export function mergeStore<S extends State>(
  ...stores: Array<Partial<Store<S>> | undefined>
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
    listener: Listener<Pick<S, K>>,
    keys?: K[]
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
  /**
   * Register a callback function that's called when the store is initialized.
   * @deprecated This is experimental and may be removed in the future.
   */
  setup: (callback: () => void | (() => void)) => () => void;
  /**
   * Function that should be called when the store is initialized.
   * @deprecated This is experimental and may be removed in the future.
   */
  init: () => () => void;
  /**
   * Registers a listener function that's called immediately and synchronously
   * whenever the store state changes.
   * @deprecated This is experimental and may be removed in the future.
   */
  sync: Sync<S>;
  /**
   * Registers a listener function that's called after state changes in the
   * store.
   * @deprecated This is experimental and may be removed in the future.
   */
  subscribe: Sync<S>;
  /**
   * Registers a listener function that's called immediately and after a batch
   * of state changes in the store.
   * @deprecated This is experimental and may be removed in the future.
   */
  syncBatch: Sync<S>;
  /**
   * Creates a new store with a subset of the current store state and keeps them
   * in sync.
   * @deprecated This is experimental and may be removed in the future.
   */
  pick<K extends Array<keyof S>>(...keys: K): Store<Pick<S, K[number]>>;
  /**
   * Creates a new store with a subset of the current store state and keeps them
   * in sync.
   * @deprecated This is experimental and may be removed in the future.
   */
  omit<K extends Array<keyof S>>(...keys: K): Store<Omit<S, K[number]>>;
}
