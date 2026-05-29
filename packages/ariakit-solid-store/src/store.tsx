import { batch, init, subscribe, sync } from "@ariakit/store";
import type { Store as CoreStore, State, StoreState } from "@ariakit/store";
import { hasOwnProperty, identity } from "@ariakit/utils";
import type { AnyObject, PickByValue, SetState } from "@ariakit/utils";
import type { Accessor } from "solid-js";
import {
  createEffect,
  createMemo,
  createSignal,
  on,
  onCleanup,
  untrack,
} from "solid-js";

/**
 * A value that may be a plain value or a reactive accessor that returns it.
 * Mirrors `@solid-primitives/utils`'s `MaybeAccessor`, kept local so the store
 * bindings stay self-contained.
 */
export type MaybeAccessor<T> = T | Accessor<T>;

/**
 * Reads a `MaybeAccessor`. If it is a zero-arity function it is called,
 * otherwise it is returned as-is.
 */
function access<T>(value: MaybeAccessor<T>): T {
  return typeof value === "function" && (value as Accessor<T>).length === 0
    ? (value as Accessor<T>)()
    : (value as T);
}

export interface UseState<S> {
  /**
   * Re-renders the component when state changes and returns the current state.
   * @deprecated Use
   * [`useStoreState`](https://solid.ariakit.com/reference/use-store-state) instead.
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
   * [`useStoreState`](https://solid.ariakit.com/reference/use-store-state) instead.
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
   * [`useStoreState`](https://solid.ariakit.com/reference/use-store-state) instead.
   * @example
   * const foo = store.useState((state) => state.foo);
   */
  <V>(selector: (state: S) => V): V;
}

type StateStore<T = CoreStore> = T | null | undefined;
type StateKey<T = CoreStore> = keyof StoreState<T>;

const noopSubscribe = () => () => {};

/**
 * Receives an Ariakit store object (which can be `null` or `undefined`) and
 * returns an accessor to the current state. If a key is provided as the second
 * argument, the accessor returns the value of that key. If a selector function
 * is provided, the state is passed to it, and its return value is used.
 *
 * Unlike React, this returns an accessor rather than the value itself, so
 * downstream Solid reactive scopes that read it track the underlying signal.
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
 * Accessing the state of a store that may be `null` or `undefined` (for
 * example, using a context):
 * ```js
 * const combobox = Ariakit.useComboboxContext();
 * const value = Ariakit.useStoreState(combobox, "value");
 * ```
 */

export function useStoreState<T extends CoreStore>(
  store: MaybeAccessor<T>,
): Accessor<StoreState<T>>;

export function useStoreState<T extends CoreStore>(
  store: MaybeAccessor<StateStore<T>>,
): Accessor<StoreState<T> | undefined>;

export function useStoreState<T extends CoreStore, K extends StateKey<T>>(
  store: MaybeAccessor<T>,
  key: K,
): Accessor<StoreState<T>[K]>;

export function useStoreState<T extends CoreStore, K extends StateKey<T>>(
  store: MaybeAccessor<StateStore<T>>,
  key: K,
): Accessor<StoreState<T>[K] | undefined>;

export function useStoreState<T extends CoreStore, V>(
  store: MaybeAccessor<T>,
  selector: (state: StoreState<T>) => V,
): Accessor<V>;

export function useStoreState<T extends CoreStore, V>(
  store: MaybeAccessor<StateStore<T>>,
  selector: (state?: StoreState<T>) => V,
): Accessor<V>;

export function useStoreState(
  store: MaybeAccessor<StateStore>,
  keyOrSelector: StateKey | ((state?: AnyObject) => any) = identity,
) {
  const getSnapshot = () => {
    const key = typeof keyOrSelector === "string" ? keyOrSelector : null;
    const selector = typeof keyOrSelector === "function" ? keyOrSelector : null;
    const state = access(store)?.getState();
    if (selector) return selector(state);
    if (!state) return;
    if (!key) return;
    if (!hasOwnProperty(state, key)) return;
    return state[key];
  };

  const [state, setState] = createSignal(getSnapshot());
  // The subscription target is fixed for the lifetime of this scope. A
  // changing store is the caller's concern (handled by `useStore`'s store-swap
  // signal and `useDynamicStoreState`), not something this hook re-subscribes
  // to — matching React keying `useSyncExternalStore` on `store`.
  const $store = access(store);
  onCleanup(
    $store
      ? // The listener must not return a value: the core store stores a
        // listener's return as a disposable and later calls it, so returning
        // `setState`'s result (a state value) would crash on update/cleanup.
        subscribe($store, null, () => {
          setState(() => getSnapshot());
        })
      : noopSubscribe(),
  );

  return state;
}

type StoreStateObject<
  T extends StateStore,
  S extends StoreState<T> | undefined,
> = Record<string, StateKey<T> | ((state: S) => any)>;

type StoreStateObjectResult<
  T extends StateStore,
  S extends StoreState<T> | undefined,
  O extends StoreStateObject<T, S>,
> = {
  [K in keyof O]: O[K] extends keyof StoreState<T>
    ? O[K] extends keyof S
      ? S[O[K]]
      : StoreState<T>[O[K]] | undefined
    : O[K] extends (state: S) => infer R
      ? R
      : never;
};

/**
 * Receives an Ariakit store object (which can be `null` or `undefined`) and
 * returns an accessor to the current state. Unlike `useStoreState`, this hook
 * receives an object with keys that map to store keys or selector functions.
 */
export function useStoreStateObject<
  T extends CoreStore,
  O extends StoreStateObject<T, StoreState<T>>,
>(
  store: MaybeAccessor<T>,
  object: O,
): Accessor<StoreStateObjectResult<T, StoreState<T>, O>>;

export function useStoreStateObject<
  T extends StateStore,
  O extends StoreStateObject<T, StoreState<T> | undefined>,
>(
  store: MaybeAccessor<T>,
  object: O,
): Accessor<StoreStateObjectResult<T, StoreState<T> | undefined, O>>;

export function useStoreStateObject(
  store: MaybeAccessor<StateStore>,
  object: StoreStateObject<StateStore, State | undefined>,
) {
  const getSnapshot = (
    prev: StoreStateObjectResult<StateStore, State, any>,
  ) => {
    const state = access(store)?.getState();
    let updated = false;
    const obj = prev;

    for (const prop in object) {
      const keyOrSelector = object[prop];

      if (typeof keyOrSelector === "function") {
        const value = keyOrSelector(state);
        if (value !== obj[prop]) {
          obj[prop] = value;
          updated = true;
        }
      }

      if (typeof keyOrSelector === "string") {
        if (!state) continue;
        if (!hasOwnProperty(state, keyOrSelector)) continue;
        const value = state[keyOrSelector];
        if (value !== obj[prop]) {
          obj[prop] = value;
          updated = true;
        }
      }
    }

    return updated ? { ...obj } : obj;
  };

  const [state, setState] = createSignal(
    getSnapshot({} as StoreStateObjectResult<StateStore, State, any>),
  );
  const $store = access(store);
  onCleanup(
    $store
      ? subscribe($store, null, () => {
          setState((prev) => getSnapshot(prev));
        })
      : noopSubscribe(),
  );

  return state;
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
>(
  store: MaybeAccessor<CoreStore<S>>,
  props: P,
  key: MaybeAccessor<K>,
  setKey?: SK,
) {
  // Mirror React's `hasOwnProperty(props, key) ? props[key] : undefined` so an
  // explicit `null` prop is preserved (and pushed to the store) rather than
  // collapsed to `undefined`, which would make the sync effects bail.
  const value = () => {
    const $key = access(key) as keyof P;
    return hasOwnProperty(props, $key) ? props[$key] : undefined;
  };
  const setValue = () => (setKey ? props[setKey] : undefined);

  // (1) Push store -> prop. Re-subscribes only when the store or key identity
  // changes; `sync`'s synchronous initial call re-primes against the new
  // store. `value`/`setValue` are read untracked so a controlled-value change
  // does not tear down the subscription.
  createEffect(
    on([() => access(store), () => access(key)], ([$store, $key]) => {
      const unsync = sync($store, [$key], (state, prev) => {
        const $value = untrack(value);
        const $setValue = untrack(setValue);
        if (!$setValue) return;
        if (state[$key] === prev[$key]) return;
        // #4561: don't echo back a value we just pushed into the store,
        // which would update the prop and ping-pong with effect (2).
        if (state[$key] === $value) return;
        $setValue(state[$key]);
      });
      // `$store` is always defined here, so `sync` returns a cleanup; the
      // conditional return type of the top-level `sync` can't prove that for
      // the generic store, hence the assertion.
      onCleanup(unsync as () => void);
    }),
  );

  // (2) Push prop -> store. Tracks `value` so a controlled-value change
  // re-asserts it on the store (React gets this for free from a dep-less
  // effect). `store`/`key` are read untracked because their identity changes
  // are handled by effect (1)'s re-subscription, not by re-pushing the value.
  createEffect(() => {
    const $value = value();
    const $store = untrack(() => access(store));
    const $key = untrack(() => access(key));
    if ($value === undefined) return;

    // #4561: bail if the store already holds this value, otherwise the
    // setState below + the sync in effect (1) ping-pong into an infinite loop.
    if ($store.getState()[$key] === $value) return;

    $store.setState($key, $value as S[K]);
    const unbatch = batch($store, [$key], () => {
      const $latest = untrack(value);
      if ($latest === undefined) return;
      $store.setState($key, $latest as S[K]);
    });
    onCleanup(unbatch as () => void);
  });
}

/**
 * Creates a Solid store from a core store object and returns a tuple with an
 * accessor to the store and a function to update the store.
 * @param createStore A function that receives the props and returns a core
 * store object.
 * @param props The props to pass to the createStore function.
 */
export function useStore<T extends CoreStore, P>(
  createStore: (props: P) => T,
  props: P,
) {
  const [store, setStore] = createSignal(createStore(props));

  // #4616 (half A): adopt a dynamic store when `props.store` changes identity.
  createEffect(() => {
    const dynamicStore = access((props as { store?: MaybeAccessor<T> }).store);
    if (dynamicStore && dynamicStore !== untrack(store)) {
      setStore(() => dynamicStore);
    }
  });

  // `init` ref-counts instances, so re-init per store identity and clean up the
  // previous one on swap/dispose.
  createEffect(() => {
    onCleanup(init(store()));
  });

  // Pass the `store` accessor (not a snapshot) so `useState` re-subscribes
  // correctly after a swap.
  const useState = ((keyOrSelector: any) =>
    useStoreState(store, keyOrSelector)) as UseState<StoreState<T>>;

  const memoizedStore = createMemo(() => ({ ...store(), useState }));

  // Must not return a value: callers like `useUpdateEffect` treat a truthy
  // return as a cleanup function and register it with `onCleanup`. `setStore`
  // returns the new store object (truthy, non-function), which would crash
  // Solid's disposal (`node.cleanups[i] is not a function`). React's
  // `updateStore` is likewise a void `useEvent`. Hence the block body.
  const updateStore = () => {
    untrack(() => setStore((s) => createStore({ ...props, ...s.getState() })));
  };

  return [memoizedStore, updateStore] as const;
}

/**
 * Reads derived state from a store whose identity may change, re-subscribing
 * when the store swaps. This is the #4616 helper, generalized: wrapping
 * `useStoreState` in a memo keyed on the store accessor makes the whole
 * derivation re-instantiate its subscription when the store identity changes.
 */
export function useDynamicStoreState<T extends CoreStore, V>(
  store: Accessor<T | undefined>,
  selector: (state?: StoreState<T>) => V,
): Accessor<V> {
  return createMemo(() => {
    const s = store();
    if (!s) return selector(undefined);
    return useStoreState(s, selector)();
  });
}

export type Store<T extends CoreStore = CoreStore> = T & {
  /**
   * Re-renders the component when the state changes and returns the current
   * state.
   * @deprecated Use
   * [`useStoreState`](https://solid.ariakit.com/reference/use-store-state) instead.
   */
  useState: UseState<StoreState<T>>;
};
