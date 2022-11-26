import { BivariantCallback } from "ariakit-utils/types";
import {
  omit as _omit,
  pick as _pick,
  applyState,
  chain,
  getKeys,
  hasOwnProperty,
} from "./misc";
import { SetStateAction } from "./types";

/**
 * Creates a store.
 * @param initialState Initial state.
 * @param store Store to extend.
 */
export function createStore<S extends State>(
  initialState: S,
  ...stores: Array<PartialStore<S>>
): Store<S> {
  let state = initialState;
  let batchPrevState = state;
  let lastUpdate = Symbol();
  let updating = false;
  const updatedKeys = new Set<keyof S>();

  const listeners = new Set<Listener<S>>();
  const batchListeners = new Set<Listener<S>>();
  const disposables = new WeakMap<Listener<S>, void | (() => void)>();
  const listenerKeys = new WeakMap<Listener<S>, Array<keyof S> | undefined>();

  const setup = () => {
    if (!stores.length) return;

    const keys = getKeys(state);

    const setups = stores.map((store) => store.setup?.());

    const cleanups = keys.map((key) =>
      chain(
        stores.map((store) => {
          const storeState = store.getState?.();
          if (!storeState) return;
          if (!hasOwnProperty(storeState, key)) return;
          return store.sync?.(
            (state) => _setState(key, state[key]!, false),
            [key]
          );
        })
      )
    );

    return chain(...setups, ...cleanups);
  };

  const sub = (listener: Listener<S>, keys?: Array<keyof S>, batch = false) => {
    const set = batch ? batchListeners : listeners;
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

  const batchSync: Store<S>["batchSync"] = (listener, keys) => {
    if (!updating) {
      disposables.set(listener, listener(state, batchPrevState));
    }
    return sub(listener, keys, true);
  };

  const getState: Store<S>["getState"] = () => state;

  const _setState = <K extends keyof S>(
    key: K,
    value: SetStateAction<S[K]>,
    syncStore = true
  ) => {
    if (!hasOwnProperty(state, key)) return;

    const nextValue = applyState(value, state[key]);

    if (syncStore) {
      stores.forEach((store) => {
        store.setState?.(key, nextValue);
      });
    }

    if (nextValue === state[key]) return;

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
      batchListeners.forEach((listener) => {
        run(listener, batchPrevState, updatedKeys);
      });
      batchPrevState = snapshot;
      queueMicrotask(() => {
        // Listeners may call setState again. If we don't clear the updated keys
        // in a microtask, we may end up clearing keys right before the nested
        // setState listeners.
        updatedKeys.clear();
      });
    });
  };

  const setState: Store<S>["setState"] = (key, value) => _setState(key, value);

  const partialStore = { subscribe, sync, batchSync, getState, setState };

  const pick: Store<S>["pick"] = (...keys) =>
    createStore(_pick(state, keys), partialStore);

  const omit: Store<S>["omit"] = (...keys) =>
    createStore(_omit(state, keys), partialStore);

  return {
    ...partialStore,
    setup,
    pick,
    omit,
  };
}

/**
 * Store state type.
 */
export type State = Record<string, unknown>;

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
export type Store<S = State> = {
  /**
   * Function that should be called when the store is initialized.
   */
  setup: () => void | (() => void);
  /**
   * Registers a listener function that's called immediately and synchronously
   * whenever the store state changes.
   */
  sync: Sync<S>;
  /**
   * Registers a listener function that's called after state changes in the
   * store.
   */
  subscribe: Sync<S>;
  /**
   * Registers a listener function that's called immediately and after a batch
   * of state changes in the store.
   */
  batchSync: Sync<S>;
  /**
   * Returns the current store state.
   */
  getState(): S;
  /**
   * Sets a state value.
   */
  setState<K extends keyof S>(key: K, value: SetStateAction<S[K]>): void;
  /**
   * Creates a new store with a subset of the current store state and keeps them
   * in sync.
   */
  pick: BivariantCallback<{
    <K extends keyof S>(...keys: K[]): Store<Pick<S, K>>;
  }>;
  /**
   * Creates a new store with a subset of the current store state and keeps them
   * in sync.
   */
  omit: BivariantCallback<{
    <K extends keyof S>(...keys: K[]): Store<Omit<S, K>>;
  }>;
};

/**
 * Extracts the state type from a store type.
 * @template T Store type.
 */
export type StoreState<T> = T extends { getState(): infer S } ? S : never;

/**
 * Store that can be passed to createStore. TODO: Find a better name.
 * @template S State type.
 */
export type PartialStore<S = State> = Partial<Store<Partial<S>>>;
