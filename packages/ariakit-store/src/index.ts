import {
  applyState,
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

type StoreSetup = (callback: () => void | (() => void)) => () => void;
type StoreInit = () => () => void;
// These three are intentionally identical `Sync<S, K>` signatures; they differ
// only in runtime timing semantics, not in types: subscribe fires after a
// change; sync fires immediately on registration and synchronously on every
// change; batch fires immediately on registration, then microtask-coalesced
// on subsequent changes. See the storeSubscribe/storeSync/storeBatch
// implementations in createStore.
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
  suspendCounts?: Map<Listener<S>, number>;
  disposables: Map<Listener<S>, () => void>;
  listenerKeys: WeakMap<Listener<S>, Array<keyof S> | null>;
}

interface FastPathFrame<S> {
  group: ListenerGroup<S>;
  keyedListeners: Set<Listener<S>>;
  updatedKey: keyof S;
  currentListener: Listener<S> | null;
  notifiedListeners?: Set<Listener<S>>;
  recoverToLive?: boolean;
  recovering?: boolean;
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
    } else if (isSameValue(currentKey, updatedKey)) {
      return true;
    }
  }
  return false;
}

function isSameValue(value: unknown, other: unknown) {
  return value === other || (value !== value && other !== other);
}

function getCleanupPrevState<S extends State>(
  prevState: S,
  state: S,
  stateBeforeCleanup: S,
  updatedKey?: UpdatedKey<S>,
) {
  let cleanupPrevState: S | undefined;
  for (const key of getKeys(state)) {
    if (isSameValue(state[key], stateBeforeCleanup[key])) continue;
    if (updatedKey !== undefined && hasUpdatedKey([key], updatedKey)) continue;
    cleanupPrevState ??= { ...prevState };
    cleanupPrevState[key] = state[key];
  }
  return cleanupPrevState;
}

const MAX_REPAIR_PASSES = 100;

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

function getFastPathNotifiedListeners<S>(frame: FastPathFrame<S>) {
  const notifiedListeners = new Set<Listener<S>>();
  const currentListener = frame.currentListener;
  if (!currentListener) return notifiedListeners;
  for (const listener of frame.keyedListeners) {
    notifiedListeners.add(listener);
    if (listener === currentListener) {
      return notifiedListeners;
    }
  }
  notifiedListeners.clear();
  notifiedListeners.add(currentListener);
  return notifiedListeners;
}

function preserveFastPathNotifiedListeners<S>(frame: FastPathFrame<S>) {
  frame.notifiedListeners ??= getFastPathNotifiedListeners(frame);
}

// An existing listener re-keyed to all keys after its insertion-order slot has
// passed should stay skipped, matching the live slow path.
function hasFastPathPassedListener<S>(
  frame: FastPathFrame<S>,
  listener: Listener<S>,
) {
  if (!frame.currentListener) return false;
  let foundCurrentKeyedListener = false;
  for (const currentListener of frame.keyedListeners) {
    if (currentListener === frame.currentListener) {
      foundCurrentKeyedListener = true;
      continue;
    }
    if (!foundCurrentKeyedListener) continue;
    if (currentListener === listener) return false;
  }
  let foundListener = false;
  for (const currentListener of frame.group.listeners) {
    if (currentListener === frame.currentListener) return foundListener;
    if (currentListener === listener) {
      foundListener = true;
    }
  }
  return false;
}

function preserveFastPathFrames<S>(
  fastPathFrames: Array<FastPathFrame<S>>,
  group: ListenerGroup<S>,
  listener?: Listener<S>,
) {
  for (const frame of fastPathFrames) {
    if (frame.group !== group) continue;
    if (frame.recovering) continue;
    if (listener && !frame.keyedListeners.has(listener)) continue;
    preserveFastPathNotifiedListeners(frame);
    for (const currentListener of frame.group.listeners) {
      if (currentListener === frame.currentListener) break;
      if (!hasFastPathPassedListener(frame, currentListener)) continue;
      frame.notifiedListeners?.add(currentListener);
    }
  }
}

function preserveFastPathPassedListeners<S>(
  fastPathFrames: Array<FastPathFrame<S>>,
  group: ListenerGroup<S>,
  listener: Listener<S>,
) {
  for (const frame of fastPathFrames) {
    if (frame.group !== group) continue;
    if (frame.recovering) continue;
    if (!hasFastPathPassedListener(frame, listener)) continue;
    preserveFastPathNotifiedListeners(frame);
    frame.notifiedListeners?.add(listener);
  }
}

interface PreserveFastPathPassedKeyedListenersParams<S> {
  fastPathFrames: Array<FastPathFrame<S>>;
  group: ListenerGroup<S>;
  keys: Array<keyof S>;
  listener: Listener<S>;
}

function preserveFastPathPassedKeyedListeners<S>({
  fastPathFrames,
  group,
  keys,
  listener,
}: PreserveFastPathPassedKeyedListenersParams<S>) {
  const wasRegistered = group.listeners.has(listener);
  for (const frame of fastPathFrames) {
    if (frame.group !== group) continue;
    if (frame.recovering) continue;
    if (!keys.includes(frame.updatedKey)) continue;
    if (hasFastPathPassedListener(frame, listener)) {
      preserveFastPathNotifiedListeners(frame);
      frame.notifiedListeners?.add(listener);
    } else if (wasRegistered) {
      preserveFastPathNotifiedListeners(frame);
      frame.recoverToLive = true;
    }
  }
}

function clearFastPathNotifiedListener<S>(
  fastPathFrames: Array<FastPathFrame<S>>,
  group: ListenerGroup<S>,
  listener: Listener<S>,
) {
  for (const frame of fastPathFrames) {
    if (frame.group !== group) continue;
    frame.notifiedListeners?.delete(listener);
  }
}

interface AddFastPathKeyedListenerParams<S> {
  fastPathFrames: Array<FastPathFrame<S>>;
  group: ListenerGroup<S>;
  keys: Array<keyof S>;
  listener: Listener<S>;
}

function addFastPathKeyedListener<S>({
  fastPathFrames,
  group,
  keys,
  listener,
}: AddFastPathKeyedListenerParams<S>) {
  for (const frame of fastPathFrames) {
    if (frame.group !== group) continue;
    if (frame.recovering) continue;
    if (!keys.includes(frame.updatedKey)) continue;
    frame.keyedListeners.add(listener);
  }
}

function runPendingCleanup<S>(group: ListenerGroup<S>, listener: Listener<S>) {
  if (!group.disposables.size) return;
  const cleanup = group.disposables.get(listener);
  if (!cleanup) return;
  group.disposables.delete(listener);
  cleanup();
}

function setListenerCleanup<S>(
  group: ListenerGroup<S>,
  listener: Listener<S>,
  cleanup: () => void,
) {
  const currentCleanup = group.disposables.get(listener);
  if (!currentCleanup) {
    group.disposables.set(listener, cleanup);
    return;
  }
  group.disposables.set(listener, () => {
    currentCleanup();
    cleanup();
  });
}

function notifyStoreListener<S extends State>(
  group: ListenerGroup<S>,
  listener: Listener<S>,
  state: S,
  prevState: S,
  getState?: () => S,
  updatedKey?: UpdatedKey<S>,
) {
  if (group.suspendCounts?.has(listener)) return;
  const { disposables } = group;
  // Skip the cleanup lookup when no listener has registered a cleanup.
  // The `.size` gate keeps an empty disposables map off this hot path.
  const cleanup = disposables.size ? disposables.get(listener) : undefined;
  if (cleanup) {
    disposables.delete(listener);
    const stateBeforeCleanup = state;
    cleanup();
    state = getState?.() ?? state;
    if (state !== stateBeforeCleanup) {
      prevState =
        getCleanupPrevState(prevState, state, stateBeforeCleanup, updatedKey) ??
        prevState;
    }
  }
  const result = listener(state, prevState);
  if (result) {
    setListenerCleanup(group, listener, result);
  }
}

interface RunLiveListenersParams<S extends State> {
  group: ListenerGroup<S>;
  getState: () => S;
  prevState: S;
  updatedKey: UpdatedKey<S>;
  notifiedListeners?: Set<Listener<S>>;
}

function runLiveListeners<S extends State>({
  group,
  getState,
  prevState,
  updatedKey,
  notifiedListeners,
}: RunLiveListenersParams<S>) {
  const allKeysListeners = group.allKeysListeners;
  for (const listener of group.listeners) {
    if (notifiedListeners?.has(listener)) continue;
    if (!allKeysListeners?.has(listener)) {
      const keys = group.listenerKeys.get(listener);
      if (!hasUpdatedKey(keys, updatedKey)) continue;
    }
    notifiedListeners?.add(listener);
    notifyStoreListener(
      group,
      listener,
      getState(),
      prevState,
      getState,
      updatedKey,
    );
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
  const syncListenerGroup: ListenerGroup<S> = {
    listeners: new Set(),
    disposables: new Map(),
    listenerKeys: new WeakMap(),
  };
  const batchListenerGroup: ListenerGroup<S> = {
    listeners: new Set(),
    disposables: new Map(),
    listenerKeys: new WeakMap(),
  };

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
      if (!instances.delete(instance)) return;
      if (instances.size) return;
      destroy();
    };

    if (initializedInstances) return maybeDestroy;

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
      desyncs.push(
        subscribe(store, keys, (state, prevState) => {
          for (const key of keys) {
            if (state[key] === prevState[key]) continue;
            setState(
              key,
              state[key],
              // @ts-expect-error - Not public API. This is just to prevent
              // infinite loops.
              true,
            );
          }
        }),
      );
      // Register before the initial push, then read each key from live parent
      // state. Child sync listeners can write back to the parent while an
      // earlier key is being pushed; a stale snapshot would overwrite those
      // reentrant updates.
      for (const key of keys) {
        const liveState = store?.getState?.();
        if (!liveState) continue;
        setState(
          key,
          liveState[key],
          // @ts-expect-error - Not public API. This is just to prevent
          // infinite loops.
          true,
        );
      }
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
    // `keys` is a three-state sentinel: `undefined` means no prior registration
    // was recorded for this listener, so there is nothing to remove (short
    // circuit); `null` means an all-keys listener (delete from
    // allKeysListeners); an array means a keyed listener (delete from
    // listenersByKey). The undefined-vs-null distinction is load-bearing — the
    // early return is not redundant with the falsy branch below.
    if (keys === undefined) return;
    if (keys) {
      deleteKeyedListener(group.listenersByKey, keys, listener);
    } else {
      group.allKeysListeners?.delete(listener);
    }
  };

  // The keyed fast path only tracks notified listeners if it has to recover
  // into live listener iteration. Registration/disposal hooks preserve every
  // active frame for the listener group before re-keying mutates its bucket.
  const fastPathFrames: Array<FastPathFrame<S>> = [];

  // Registers `listener` in `group` and returns its unsubscribe. Three jobs:
  // (1) snapshot `keys` as a defensive copy (or null for an all-keys listener);
  // (2) index the listener — re-registering the same listener first clears its
  // previous index entries so a re-keyed listener is never left in a stale key
  // bucket; (3) return a disposer that removes the listener from the set, the
  // key index, and the disposables/keys maps before running any pending
  // cleanup.
  const registerListener = (
    keys: Array<keyof S> | null,
    listener: Listener<S>,
    group = syncListenerGroup,
  ) => {
    const listenerKeysValue = keys ? [...keys] : null;
    const wasRegistered = group.listeners.has(listener);
    if (!wasRegistered) {
      clearFastPathNotifiedListener(fastPathFrames, group, listener);
    }
    if (!listenerKeysValue) {
      if (wasRegistered) {
        preserveFastPathFrames(fastPathFrames, group);
      }
      preserveFastPathPassedListeners(fastPathFrames, group, listener);
    } else {
      preserveFastPathPassedKeyedListeners({
        fastPathFrames,
        group,
        keys: listenerKeysValue,
        listener,
      });
    }
    if (wasRegistered) {
      preserveFastPathFrames(fastPathFrames, group, listener);
      deleteListenerIndexes(group, listener, group.listenerKeys.get(listener));
    }
    group.listeners.add(listener);
    if (listenerKeysValue) {
      group.listenersByKey ??= new Map();
      addKeyedListener(group.listenersByKey, listenerKeysValue, listener);
      addFastPathKeyedListener({
        fastPathFrames,
        group,
        keys: listenerKeysValue,
        listener,
      });
    } else {
      group.allKeysListeners ??= new Set();
      group.allKeysListeners.add(listener);
    }
    group.listenerKeys.set(listener, listenerKeysValue);
    return () => {
      const cleanup = group.disposables.get(listener);
      group.disposables.delete(listener);
      preserveFastPathFrames(fastPathFrames, group, listener);
      const currentKeys = group.listenerKeys.get(listener);
      deleteListenerIndexes(group, listener, listenerKeysValue);
      if (currentKeys !== listenerKeysValue) {
        deleteListenerIndexes(group, listener, currentKeys);
      }
      group.listenerKeys.delete(listener);
      group.listeners.delete(listener);
      cleanup?.();
    };
  };

  const storeSubscribe: StoreSubscribe<S> = (keys, listener) =>
    registerListener(keys, listener);

  // Runs a listener's initial synchronous invocation while preventing reentrant
  // dispatch from running the same listener before the new registration is
  // complete.
  const runInitialListener = (
    group: ListenerGroup<S>,
    listener: Listener<S>,
    prevState: S,
  ) => {
    const shouldSuspend = group.listeners.has(listener);
    if (shouldSuspend) {
      group.suspendCounts ??= new Map();
      const count = group.suspendCounts.get(listener) ?? 0;
      group.suspendCounts.set(listener, count + 1);
    }
    let cleanupPrevState: S | undefined;
    try {
      const stateBeforeCleanups = state;
      runPendingCleanup(group, listener);
      if (state !== stateBeforeCleanups) {
        cleanupPrevState = getCleanupPrevState(
          prevState,
          state,
          stateBeforeCleanups,
        );
      }
      const initialPrevState = cleanupPrevState ?? prevState;
      const cleanup = listener(state, initialPrevState);
      if (cleanup) {
        setListenerCleanup(group, listener, cleanup);
      }
    } finally {
      if (shouldSuspend) {
        const suspendCounts = group.suspendCounts;
        const count = suspendCounts?.get(listener);
        if (count && count > 1) {
          suspendCounts?.set(listener, count - 1);
        } else {
          suspendCounts?.delete(listener);
        }
        if (!suspendCounts?.size) {
          delete group.suspendCounts;
        }
      }
    }
  };

  const storeSync: StoreSync<S> = (keys, listener) => {
    runInitialListener(syncListenerGroup, listener, state);
    return registerListener(keys, listener);
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
    runInitialListener(batchListenerGroup, listener, prevStateBatch);
    return registerListener(keys, listener, batchListenerGroup);
  };

  // These reference `finalStore`, declared at the bottom of createStore. The
  // forward reference is safe because these arrows only run after createStore
  // returns, and it's intentional: the picked/omitted stores extend this store
  // so they stay bidirectionally synced to it.
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
    if (!(updatedKey instanceof Set) && !group.allKeysListeners?.size) {
      const keyedListeners = group.listenersByKey?.get(updatedKey);
      if (!keyedListeners) return;
      const frame: FastPathFrame<S> = {
        group,
        keyedListeners,
        updatedKey,
        currentListener: null,
      };
      fastPathFrames.push(frame);

      try {
        for (const listener of keyedListeners) {
          if (frame.notifiedListeners?.has(listener)) continue;
          frame.currentListener = listener;
          frame.notifiedListeners?.add(listener);
          notifyStoreListener(
            group,
            listener,
            state,
            prevState,
            getState,
            updatedKey,
          );
          if (!group.allKeysListeners?.size && !frame.recoverToLive) continue;
          const notifiedListeners =
            frame.notifiedListeners ?? getFastPathNotifiedListeners(frame);
          frame.notifiedListeners = notifiedListeners;
          frame.recovering = true;
          runLiveListeners({
            group,
            getState,
            prevState,
            updatedKey,
            notifiedListeners,
          });
          return;
        }
      } finally {
        fastPathFrames.pop();
      }
      return;
    }

    runLiveListeners({ group, getState, prevState, updatedKey });
  };

  // `fromStores` marks an update that originated from an extended parent store
  // syncing its value down (set only by storeInit's sync wiring). Such updates
  // must not be fanned back out to the parents, or the two stores would keep
  // updating each other forever. Public callers always omit it.
  const setState: Store<S>["setState"] = (key, value, fromStores = false) => {
    if (!hasOwnProperty(state, key)) return;

    const currentValue = state[key];
    const nextValue = applyState(value, () => currentValue);

    if (isSameValue(nextValue, currentValue)) return;

    // Track the active dispatch so storeBatch can distinguish idle
    // registration (refresh prevStateBatch) from registration during an
    // in-flight setState (keep prevStateBatch so the upcoming microtask
    // reports the correct diff).
    const wasInDispatch = inDispatch;
    inDispatch = true;
    const prevState = state;
    const nextState = { ...state, [key]: nextValue };
    state = nextState;
    let superseded = false;
    try {
      // Fan a locally-originated change out to extended parent stores so they
      // stay in sync. Both short-circuits are load-bearing: `!fromStores`
      // prevents the parent/child sync loop (storeInit pushes parent updates
      // down with `fromStores`), and `stores.length` skips the iteration
      // entirely on the common store-without-parents path.
      if (!fromStores && stores.length) {
        for (const store of stores) {
          store?.setState?.(key, nextValue);
          // Parent fan-out can reenter this child with a newer value for the
          // same key. That nested update owns the final notification, so stop
          // replaying the stale outer value.
          if (isSameValue(state[key], nextValue)) continue;
          superseded = true;
          break;
        }
        // A fromStores-driven supersede can't fan out on its own. Push the
        // latest committed value to every parent until a repair pass completes
        // without another rewrite. Keep this bounded because parent listeners
        // can fight over a key indefinitely.
        if (superseded) {
          let pass = 0;
          for (; pass < MAX_REPAIR_PASSES; pass += 1) {
            let changed = false;
            for (const store of stores) {
              const previousValue = state[key];
              store?.setState?.(key, previousValue);
              if (!isSameValue(state[key], previousValue)) {
                changed = true;
              }
            }
            if (!changed) break;
          }
          if (
            process.env.NODE_ENV !== "production" &&
            pass === MAX_REPAIR_PASSES
          ) {
            console.warn(
              "Parent stores did not converge after a superseded fan-out; " +
                "a parent listener may be rewriting this key in a cycle.",
            );
          }
        }
      }

      // Parent fan-out can reenter this store and commit nested updates to
      // other keys before these listeners run, advancing `state` past
      // `nextState`. Preserve those nested updates in the previous snapshot,
      // restoring only `key` to its pre-update value so this notification still
      // reports the original diff. When nothing reentered, reuse `prevState`
      // directly and skip the allocation.
      if (!superseded) {
        const listenerPrevState =
          state === nextState ? prevState : { ...state, [key]: prevState[key] };
        runListeners(syncListenerGroup, listenerPrevState, key);
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
export function pick(store?: Store, ...args: Parameters<StorePick>) {
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
