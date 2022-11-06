import {
  omit as _omit,
  pick as _pick,
  applyState,
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
  store?: PartialStore<S>
): Store<S> {
  let state = initialState as S;
  let prevState = state;
  let lastUpdate = Symbol();
  let updatedKeys: Array<keyof S> = [];
  const computers = new Set<Listener<S>>();
  const subscribers = new Set<Listener<S>>();
  const disposables = new WeakMap<Listener<S>, void | (() => void)>();
  const listenerKeys = new WeakMap<Listener<S>, Array<keyof S> | undefined>();

  const registerListener = (
    set: Set<Listener<S>>,
    listener: Listener<S>,
    keys?: Array<keyof S>
  ) => {
    set.add(listener);
    listenerKeys.set(listener, keys);
    return () => {
      disposables.get(listener)?.();
      disposables.delete(listener);
      set.delete(listener);
      listenerKeys.delete(listener);
    };
  };

  const sync: Store<S>["sync"] = (listener, keys) => {
    disposables.set(listener, listener(getState(), getState()));
    return registerListener(computers, listener, keys);
  };

  const subscribe: Store<S>["subscribe"] = (listener, keys) =>
    registerListener(subscribers, listener, keys);

  const effect: Store<S>["effect"] = (listener, keys) => {
    disposables.set(listener, listener(getState(), getState()));
    return subscribe(listener, keys);
  };

  const getState: Store<S>["getState"] = () => {
    if (store?.getState) {
      const parentState = store.getState();
      const keys = Object.keys(parentState);
      for (const key of keys) {
        if (!hasOwnProperty(state, key)) continue;
        const value = state[key];
        const parentValue = parentState[key];
        if (value !== parentValue) {
          state = { ...state, [key]: parentValue };
        }
      }
    }
    return state;
  };

  const setState: Store<S>["setState"] = <K extends keyof S>(
    key: K,
    value: SetStateAction<S[K]>
  ) => {
    const currentState = getState();

    if (!hasOwnProperty(currentState, key)) return;

    if (store?.setState) {
      store.setState(key, value);
    }

    const currentValue = currentState[key];
    const nextValue = applyState(value, currentValue);

    if (nextValue === currentValue) return;

    state = { ...currentState, [key]: nextValue };

    const thisUpdate = Symbol();
    lastUpdate = thisUpdate;
    updatedKeys.push(key);

    const runListener = (
      listener: Listener<S>,
      prevState = currentState,
      updatedKeys: Array<keyof S> = [key]
    ) => {
      const keys = listenerKeys.get(listener);
      if (keys && !keys.some((key) => updatedKeys.includes(key))) return;
      disposables.get(listener)?.();
      disposables.set(listener, listener(state, prevState));
    };

    computers.forEach((listener) => runListener(listener));

    queueMicrotask(() => {
      if (lastUpdate !== thisUpdate) return;
      queueMicrotask(() => {
        prevState = state;
      });
      subscribers.forEach((listener) =>
        runListener(listener, prevState, updatedKeys)
      );
      updatedKeys = [];
    });
  };

  const pick: Store<S>["pick"] = (...keys) => {
    const nextState = _pick(state, keys);
    return createStore(nextState, { getState, setState });
  };

  const omit: Store<S>["omit"] = (...keys) => {
    const nextState = _omit(state, keys);
    return createStore(nextState, { getState, setState });
  };

  return { sync, subscribe, effect, getState, setState, pick, omit };
}

/**
 * Store state type.
 */
export type State = Record<keyof any, unknown>;

/**
 * Store listener type.
 * @template S State type.
 */
export type Listener<S> = (state: S, prevState: S) => void | (() => void);

/**
 * Subscriber function type used by `sync`, `subscribe` and `effect`.
 * @template S State type.
 */
export type Subscribe<S = State> = {
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
  setup?: () => void | (() => void);
  /**
   * Registers a listener function that's called immediately and synchronously
   * whenever the store state changes.
   */
  sync: Subscribe<S>;
  /**
   * Registers a listener function that's called after a batch of state changes
   * in the store.
   */
  subscribe: Subscribe<S>;
  /**
   * Registers a listener function that's called immediately and after a batch
   * of state changes in the store.
   */
  effect: Subscribe<S>;
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
 * Creates a partial store type from a state type.
 * @template S State type.
 */
export type PartialStore<S = State> = Partial<Store<Partial<S>>>;

/**
 * Creates a parent store type from a state type.
 * @template S State type.
 */
export type ParentStore<S = State> = Pick<
  PartialStore<S>,
  "getState" | "setState"
>;
