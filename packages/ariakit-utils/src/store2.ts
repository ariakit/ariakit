import {
  omit as _omit,
  pick as _pick,
  applyState,
  chain,
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
  store?: DerivedStore<S>
): Store<S> {
  let state = initialState;
  let prevState = state;
  let batchPrevState = state;
  let lastUpdate = Symbol();
  let updating = false;
  const updatedKeys = new Set<keyof S>();

  const listeners = new Set<Listener<S>>();
  const batchListeners = new Set<Listener<S>>();
  const disposables = new WeakMap<Listener<S>, void | (() => void)>();
  const listenerKeys = new WeakMap<Listener<S>, Array<keyof S> | undefined>();

  const setup = () => {
    return chain(
      store?.setup?.(),
      store?.sync((storeState) => {
        for (const key in storeState) {
          const value = storeState[key];
          if (value === state[key]) continue;
          if (!hasOwnProperty(state, key)) continue;
          setState(key, value!);
        }
      })
    );
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
    disposables.set(listener, listener(state, prevState));
    return sub(listener, keys);
  };

  const batchSync: Store<S>["batchSync"] = (listener, keys) => {
    if (!updating) {
      disposables.set(listener, listener(state, batchPrevState));
    }
    return sub(listener, keys, true);
  };

  const getState: Store<S>["getState"] = () => state;

  const setState: Store<S>["setState"] = (key, value) => {
    if (!hasOwnProperty(state, key)) return;

    if (store) {
      store.setState(key, value);
    }

    const currentValue = state[key];
    const nextValue = applyState(value, currentValue);

    if (nextValue === currentValue) return;

    prevState = state;
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
        // Clear updated keys after all batch listeners are called and right
        // before the next batch of updates. This is to ensure that the updated
        // keys are cleared even if the batch listeners setState.
        updatedKeys.clear();
      });
    });
  };

  const pick: Store<S>["pick"] = (...keys) => {
    const nextState = _pick(state, keys);
    return createStore(nextState, { sync, setState });
  };

  const omit: Store<S>["omit"] = (...keys) => {
    const nextState = _omit(state, keys);
    return createStore(nextState, { sync, setState });
  };

  return {
    setup,
    subscribe,
    sync,
    batchSync,
    getState,
    setState,
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
  pick<K extends keyof S>(...keys: K[]): Store<Pick<S, K>>;
  /**
   * Creates a new store with a subset of the current store state and keeps them
   * in sync.
   */
  omit<K extends keyof S>(...keys: K[]): Store<Omit<S, K>>;
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
export type DerivedStore<S = State> = Pick<
  Partial<Store<Partial<S>>>,
  "setup"
> &
  Pick<Store<Partial<S>>, "sync" | "setState">;

(async () => {
  const store1 = createStore({ a: 1, b: 2, c: 10 });
  // store1.setup();

  const store2 = createStore({ a: 2, b: 2, d: 10 }, store1);
  store2.setup();

  store1.batchSync(
    (state, prevState) => {
      console.log(`store1 ${prevState.a} -> ${state.a}`);
    },
    ["a"]
  );

  store2.batchSync(
    (state, prevState) => {
      console.log(`store2 ${prevState.a} -> ${state.a}`);
      store2.setState("a", 3);
      store2.setState("a", 5);
      store2.setState("a", 5);
      store2.setState("a", 7);
    },
    ["a"]
  );

  // store1.batchSync(
  //   (state, prevState) => {
  //     // if (state === prevState) return;
  //     console.log(`store1 batch ${prevState.a} -> ${state.a}`);
  //     store2.setState("a", 5);
  //   },
  //   ["a"]
  // );

  // store2.batchSync(
  //   (state, prevState) => {
  //     if (state === prevState) return;
  //     console.log(`store2 batch ${prevState.a} -> ${state.a}`);
  //   },
  //   ["a"]
  // );

  store2.setState("a", 4);
  queueMicrotask(() => {
    console.log(store2.getState());
  });
})();
