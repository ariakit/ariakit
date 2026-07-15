import { afterEach, expect, expectTypeOf, test, vi } from "vitest";
import {
  batch,
  createStore,
  init,
  mergeStore,
  omit,
  pick,
  setup,
  subscribe,
  sync,
  throwOnConflictingProps,
} from "./index.ts";
import type { Store, StoreOptions, StoreProps, StoreState } from "./index.ts";

afterEach(() => {
  vi.unstubAllEnvs();
});

function flushBatch() {
  return new Promise<void>((resolve) => queueMicrotask(resolve));
}

test("preserves the public type surface", () => {
  interface SampleState {
    count: number;
    label: string;
    mounted: boolean;
  }

  const store = createStore<SampleState>({
    count: 0,
    label: "label",
    mounted: false,
  });

  expectTypeOf<StoreState<typeof store>>().toEqualTypeOf<SampleState>();
  expectTypeOf<StoreOptions<SampleState, "count" | "label">>().toEqualTypeOf<
    Partial<Pick<SampleState, "count" | "label">>
  >();
  expectTypeOf<StoreProps<SampleState>["store"]>().toEqualTypeOf<
    Store<Partial<SampleState>> | undefined
  >();

  store.setState("count", (count) => count + 1);

  const unsubscribe = subscribe(store, ["count"], (state, prevState) => {
    expectTypeOf(state).toEqualTypeOf<Pick<SampleState, "count">>();
    expectTypeOf(prevState).toEqualTypeOf<Pick<SampleState, "count">>();
  });
  unsubscribe();

  const stopSync = sync(store, null, (state, prevState) => {
    expectTypeOf(state).toEqualTypeOf<SampleState>();
    expectTypeOf(prevState).toEqualTypeOf<SampleState>();
  });
  stopSync();

  const stopBatch = batch(store, ["label", "mounted"], (state) => {
    expectTypeOf(state).toEqualTypeOf<Pick<SampleState, "label" | "mounted">>();
  });
  stopBatch();

  const pickedStore = pick(store, ["count", "label"] as const);
  expectTypeOf<StoreState<typeof pickedStore>>().toEqualTypeOf<
    Pick<SampleState, "count" | "label">
  >();

  const omittedStore = omit(store, ["mounted"] as const);
  expectTypeOf<StoreState<typeof omittedStore>>().toEqualTypeOf<
    Omit<SampleState, "mounted">
  >();

  const expectInvalidStoreTypes = () => {
    // @ts-expect-error Invalid state key.
    store.setState("missing", 1);
    // @ts-expect-error Invalid state value.
    store.setState("count", "1");
    // @ts-expect-error Invalid updater return value.
    store.setState("count", () => "1");
  };

  expectTypeOf(expectInvalidStoreTypes).toEqualTypeOf<() => void>();
});

test("sets known state keys and ignores unknown keys", () => {
  interface State {
    [key: string]: unknown;
    count: number;
    optional: string | undefined;
  }

  const store = createStore<State>({ count: 0, optional: undefined });

  expect(store.getState()).toEqual({ count: 0, optional: undefined });
  expect("optional" in store.getState()).toBe(true);

  store.setState("count", 1);
  store.setState("optional", "value");

  expect(store.getState()).toEqual({ count: 1, optional: "value" });

  store.setState("optional", undefined);
  expect(store.getState()).toEqual({ count: 1, optional: undefined });
  expect("optional" in store.getState()).toBe(true);

  store.setState("missing", true);

  expect(store.getState()).toEqual({ count: 1, optional: undefined });
  expect("missing" in store.getState()).toBe(false);
});

test("sets state with updater functions", () => {
  const store = createStore({ count: 0 });
  const listener = vi.fn();

  subscribe(store, ["count"], listener);

  store.setState("count", (count) => count + 1);
  store.setState("count", (count) => count + 1);

  expect(store.getState()).toEqual({ count: 2 });
  expect(listener).toHaveBeenCalledTimes(2);
  expect(listener).toHaveBeenLastCalledWith({ count: 2 }, { count: 1 });

  store.setState("count", (count) => count);
  expect(listener).toHaveBeenCalledTimes(2);
});

test("does not notify listeners for strict-equal values", () => {
  const object = { id: 1 };
  const store = createStore({ count: 0, object });
  const listener = vi.fn();

  subscribe(store, null, listener);

  store.setState("count", 0);
  store.setState("object", object);

  expect(listener).not.toHaveBeenCalled();

  store.setState("object", { id: 1 });

  expect(listener).toHaveBeenCalledOnce();
  expect(store.getState()).toEqual({ count: 0, object: { id: 1 } });
});

test("passes immutable state snapshots to listeners", () => {
  const store = createStore({ count: 0, label: "a" });
  const initialState = store.getState();
  const calls: Array<[StoreState<typeof store>, StoreState<typeof store>]> = [];

  subscribe(store, null, (state, prevState) => {
    calls.push([state, prevState]);
  });

  store.setState("count", 1);

  const nextState = store.getState();

  expect(nextState).not.toBe(initialState);
  expect(initialState).toEqual({ count: 0, label: "a" });
  expect(calls).toHaveLength(1);
  expect(calls[0]?.[0]).toBe(nextState);
  expect(calls[0]?.[1]).toBe(initialState);
});

test("subscribes to selected state changes", () => {
  const store = createStore({ count: 0, label: "a" });
  const calls: Array<[number, number]> = [];

  const unsubscribe = subscribe(store, ["count"], (state, prevState) => {
    calls.push([state.count, prevState.count]);
  });

  expect(calls).toEqual([]);

  store.setState("label", "b");
  expect(calls).toEqual([]);

  store.setState("count", 1);
  expect(calls).toEqual([[1, 0]]);

  unsubscribe();
  store.setState("count", 2);

  expect(calls).toEqual([[1, 0]]);
});

test("subscribes to NaN state keys on all listener paths", () => {
  const getCalls = (forceSlowPath = false) => {
    const key = Number.NaN;
    const store = createStore({ [key]: 0 });
    let calls = 0;

    if (forceSlowPath) {
      subscribe(store, null, () => {});
    }

    subscribe(store, [key], (state, prevState) => {
      calls += 1;
      expect(state[key]).toBe(1);
      expect(prevState[key]).toBe(0);
    });
    store.setState(key, 1);
    return calls;
  };

  expect(getCalls()).toBe(1);
  expect(getCalls(true)).toBe(1);
});

test("captures selected state keys when subscribing", () => {
  const store = createStore({ count: 0, label: "a" });
  const keys: Array<"count" | "label"> = ["count"];
  const listener = vi.fn();

  subscribe(store, keys, listener);

  keys[0] = "label";

  store.setState("label", "b");
  expect(listener).not.toHaveBeenCalled();

  store.setState("count", 1);
  expect(listener).toHaveBeenCalledOnce();
});

test("keeps reused listener callbacks on their latest keys", () => {
  const store = createStore({ count: 0, label: "a" });
  const listener = vi.fn();

  subscribe(store, ["count"], listener);
  const unsubscribe = subscribe(store, ["label"], listener);

  store.setState("count", 1);
  expect(listener).not.toHaveBeenCalled();

  store.setState("label", "b");
  expect(listener).toHaveBeenCalledOnce();

  listener.mockClear();
  unsubscribe();

  store.setState("count", 2);
  store.setState("label", "c");

  expect(listener).not.toHaveBeenCalled();
});

test("keeps reused callbacks isolated between listener groups", async () => {
  const store = createStore({ count: 0, label: "a" });
  const events: string[] = [];
  let runs = 0;
  const listener = vi.fn(() => {
    runs += 1;
    const run = runs;
    events.push(`run ${run}`);
    return () => events.push(`cleanup ${run}`);
  });

  subscribe(store, null, () => {});
  subscribe(store, ["count"], listener);
  batch(store, ["label"], listener);

  expect(events).toEqual(["run 1"]);

  events.length = 0;
  listener.mockClear();

  store.setState("count", 1);

  expect(events).toEqual(["run 2"]);
  expect(listener).toHaveBeenCalledOnce();

  events.length = 0;

  await flushBatch();

  expect(events).toEqual([]);

  store.setState("label", "b");

  expect(events).toEqual([]);

  await flushBatch();

  expect(events).toEqual(["cleanup 1", "run 3"]);
  expect(listener).toHaveBeenCalledTimes(2);
});

test("sync runs immediately and cleans up before rerun and unsubscribe", () => {
  const store = createStore({ count: 0, label: "a" });
  const events: string[] = [];

  const unsubscribe = sync(store, ["count"], (state, prevState) => {
    events.push(`${prevState.count}->${state.count}`);
    return () => events.push(`cleanup ${state.count}`);
  });

  expect(events).toEqual(["0->0"]);

  store.setState("label", "b");
  expect(events).toEqual(["0->0"]);

  store.setState("count", 1);
  expect(events).toEqual(["0->0", "cleanup 0", "0->1"]);

  unsubscribe();
  expect(events).toEqual(["0->0", "cleanup 0", "0->1", "cleanup 1"]);

  store.setState("count", 2);
  expect(events).toEqual(["0->0", "cleanup 0", "0->1", "cleanup 1"]);
});

test("detaches sync listeners before unsubscribe cleanups update state", () => {
  const store = createStore({ count: 0 });
  const events: string[] = [];
  let runCount = 0;
  let nudged = false;

  const unsubscribe = sync(store, ["count"], () => {
    runCount += 1;
    const id = runCount;
    events.push(`run ${id}`);
    return () => {
      events.push(`cleanup ${id}`);
      if (nudged) return;
      nudged = true;
      store.setState("count", (count) => count + 1);
    };
  });

  expect(events).toEqual(["run 1"]);

  unsubscribe();

  expect(store.getState()).toEqual({ count: 1 });
  expect(events).toEqual(["run 1", "cleanup 1"]);
});

test("subscribe cleans up before rerun and unsubscribe", () => {
  const store = createStore({ count: 0 });
  const events: string[] = [];

  const unsubscribe = subscribe(store, null, (state) => {
    events.push(`run ${state.count}`);
    return () => events.push(`cleanup ${state.count}`);
  });

  store.setState("count", 1);
  expect(events).toEqual(["run 1"]);

  store.setState("count", 2);
  expect(events).toEqual(["run 1", "cleanup 1", "run 2"]);

  unsubscribe();
  expect(events).toEqual(["run 1", "cleanup 1", "run 2", "cleanup 2"]);
});

test("sync listeners can set state reentrantly", () => {
  const store = createStore({ open: false, mounted: false });
  const calls: Array<[boolean, boolean, boolean, boolean]> = [];

  sync(store, ["open", "mounted"], (state, prevState) => {
    calls.push([prevState.open, state.open, prevState.mounted, state.mounted]);
    if (state.mounted !== state.open) {
      store.setState("mounted", state.open);
    }
  });

  store.setState("open", true);

  expect(store.getState()).toEqual({ open: true, mounted: true });
  expect(calls).toEqual([
    [false, false, false, false],
    [false, true, false, false],
    [true, true, false, true],
  ]);
});

test("batch runs immediately and coalesces state changes", async () => {
  const store = createStore({ count: 0, label: "a", open: false });
  const calls: Array<{
    state: Pick<StoreState<typeof store>, "count" | "label">;
    prevState: Pick<StoreState<typeof store>, "count" | "label">;
  }> = [];

  const unsubscribe = batch(store, ["count", "label"], (state, prevState) => {
    calls.push({
      state: { count: state.count, label: state.label },
      prevState: { count: prevState.count, label: prevState.label },
    });
  });

  expect(calls).toEqual([
    {
      state: { count: 0, label: "a" },
      prevState: { count: 0, label: "a" },
    },
  ]);

  store.setState("count", 1);
  store.setState("label", "b");
  store.setState("open", true);

  expect(calls).toHaveLength(1);

  await flushBatch();

  expect(calls).toEqual([
    {
      state: { count: 0, label: "a" },
      prevState: { count: 0, label: "a" },
    },
    {
      state: { count: 1, label: "b" },
      prevState: { count: 0, label: "a" },
    },
  ]);

  store.setState("open", false);
  await flushBatch();

  expect(calls).toHaveLength(2);

  unsubscribe();
  store.setState("count", 2);
  await flushBatch();

  expect(calls).toHaveLength(2);
});

test("batch listeners can set state for later batch listeners", async () => {
  const store = createStore({ count: 0, derived: 0 });
  const derived = vi.fn();

  batch(store, ["count"], (state) => {
    store.setState("derived", state.count * 2);
  });

  batch(store, ["derived"], (state, prevState) => {
    derived(state.derived, prevState.derived);
  });

  derived.mockClear();

  store.setState("count", 1);
  await flushBatch();
  await flushBatch();

  expect(store.getState()).toEqual({ count: 1, derived: 2 });
  expect(derived).toHaveBeenCalledOnce();
  expect(derived).toHaveBeenLastCalledWith(2, 0);
});

test("batch listeners can set state for earlier batch listeners", async () => {
  const store = createStore({ count: 0, derived: 0 });
  const derived = vi.fn();

  batch(store, ["derived"], (state, prevState) => {
    derived(state.derived, prevState.derived);
  });

  batch(store, ["count"], (state) => {
    store.setState("derived", state.count * 2);
  });

  derived.mockClear();

  store.setState("count", 1);
  await flushBatch();
  await flushBatch();

  expect(store.getState()).toEqual({ count: 1, derived: 2 });
  expect(derived).toHaveBeenCalledOnce();
  expect(derived).toHaveBeenLastCalledWith(2, 0);
});

test("does not rerun empty-key sync and batch listeners after registration", async () => {
  const store = createStore({ count: 0 });
  const syncListener = vi.fn();
  const batchListener = vi.fn();

  sync(store, [], syncListener);
  batch(store, [], batchListener);

  expect(syncListener).toHaveBeenCalledOnce();
  expect(batchListener).toHaveBeenCalledOnce();

  store.setState("count", 1);
  await flushBatch();

  expect(syncListener).toHaveBeenCalledOnce();
  expect(batchListener).toHaveBeenCalledOnce();
});

test("re-registers a listener without dragging a stale cleanup forward", () => {
  const store = createStore({ count: 0 });
  const events: string[] = [];
  let runCount = 0;
  let withCleanup = true;
  const listener = (): (() => void) | undefined => {
    runCount += 1;
    const id = runCount;
    events.push(`run ${id}`);
    if (!withCleanup) return undefined;
    return () => events.push(`cleanup ${id}`);
  };

  sync(store, null, listener);
  store.setState("count", 1);
  expect(events).toEqual(["run 1", "cleanup 1", "run 2"]);

  withCleanup = false;
  sync(store, null, listener);
  store.setState("count", 2);

  // "cleanup 2" must fire before "run 3" so the previous registration
  // doesn't leak its pending cleanup.
  expect(events).toEqual([
    "run 1",
    "cleanup 1",
    "run 2",
    "cleanup 2",
    "run 3",
    "run 4",
  ]);
});

test("runs a pending sync cleanup when re-registering a listener", () => {
  const store = createStore({ count: 0, enabled: false });
  let active = 0;

  const listener = () => {
    active += 1;
    return () => {
      active -= 1;
    };
  };

  const first = sync(store, ["count"], listener);
  const second = sync(store, ["count", "enabled"], listener);

  expect(active).toBe(1);

  second();
  first();

  expect(active).toBe(0);
});

test("does not leak sync cleanup when re-registration cleanup updates state", () => {
  const store = createStore({ count: 0, enabled: false });
  let active = 0;
  let updateOnCleanup = true;

  const listener = () => {
    active += 1;
    return () => {
      active -= 1;
      if (!updateOnCleanup) return;
      updateOnCleanup = false;
      store.setState("count", (count) => count + 1);
    };
  };

  const first = sync(store, ["count"], listener);
  const second = sync(store, ["count", "enabled"], listener);

  expect(active).toBe(1);

  second();
  first();

  expect(active).toBe(0);
});

test("keeps sync re-registration cleanup updates out of the initial diff", () => {
  const store = createStore({ count: 0, enabled: false });
  const changes: Array<[number, number]> = [];

  const listener = (state: { count: number }, prevState: { count: number }) => {
    changes.push([state.count, prevState.count]);
    return () => {
      store.setState("count", (count) => (count === 0 ? count + 1 : count));
    };
  };

  const first = sync(store, ["count"], listener);
  changes.length = 0;

  const second = sync(store, ["count", "enabled"], listener);
  second();
  first();

  expect(changes).toEqual([[1, 1]]);
});

test("does not leak sync cleanup when re-registration listener updates state", () => {
  const store = createStore({ count: 0, enabled: false });
  let active = 0;
  let updateOnRun = false;

  const listener = () => {
    active += 1;
    if (updateOnRun) {
      updateOnRun = false;
      store.setState("count", (count) => count + 1);
    }
    return () => {
      active -= 1;
    };
  };

  const first = sync(store, ["count"], listener);
  updateOnRun = true;
  const second = sync(store, ["count", "enabled"], listener);

  expect(active).toBe(1);

  second();
  first();

  expect(active).toBe(0);
});

test("keeps dispatch cleanup updates out of the outer rerun diff", () => {
  const store = createStore({ count: 0, enabled: false });
  const changes: Array<[number, number, boolean, boolean]> = [];
  let updateOnCleanup = true;

  sync(store, ["count", "enabled"], (state, prevState) => {
    changes.push([
      state.count,
      prevState.count,
      state.enabled,
      prevState.enabled,
    ]);
    return () => {
      if (!updateOnCleanup) return;
      updateOnCleanup = false;
      store.setState("enabled", true);
    };
  });
  changes.length = 0;

  store.setState("count", 1);

  expect(changes).toEqual([
    [1, 1, true, false],
    [1, 0, true, true],
  ]);
});

test("preserves the dispatched key diff after cleanup updates it", () => {
  const store = createStore({ count: 0 });
  const changes: Array<[number, number]> = [];
  let updateOnCleanup = true;

  sync(store, ["count"], (state, prevState) => {
    changes.push([state.count, prevState.count]);
    return () => {
      if (!updateOnCleanup) return;
      updateOnCleanup = false;
      store.setState("count", 2);
    };
  });
  changes.length = 0;

  store.setState("count", 1);

  expect(changes).toEqual([
    [2, 1],
    [2, 0],
  ]);
});

test("preserves an empty-string key diff after cleanup updates it", () => {
  const store = createStore({ "": 0 });
  const changes: Array<[number, number]> = [];
  let updateOnCleanup = true;

  sync(store, [""], (state, prevState) => {
    changes.push([state[""], prevState[""]]);
    return () => {
      if (!updateOnCleanup) return;
      updateOnCleanup = false;
      store.setState("", 2);
    };
  });
  changes.length = 0;

  store.setState("", 1);

  expect(changes).toEqual([
    [2, 1],
    [2, 0],
  ]);
});

test("does not drain cleanups installed by re-registration cleanups", () => {
  const store = createStore({ count: 0 });
  const events: string[] = [];
  let active = 0;
  let runCount = 0;
  let registerFromCleanup = true;

  const listener = () => {
    active += 1;
    runCount += 1;
    const id = runCount;
    events.push(`run ${id}`);
    return () => {
      active -= 1;
      events.push(`cleanup ${id}`);
      if (!registerFromCleanup) return;
      registerFromCleanup = false;
      sync(store, ["count"], listener);
    };
  };

  const first = sync(store, ["count"], listener);
  const second = sync(store, ["count"], listener);

  expect(events).toEqual(["run 1", "cleanup 1", "run 2", "run 3"]);
  expect(active).toBe(2);

  second();
  expect(active).toBe(0);

  first();
  expect(active).toBe(0);
  expect(events).toEqual([
    "run 1",
    "cleanup 1",
    "run 2",
    "run 3",
    "cleanup 2",
    "cleanup 3",
  ]);
});

test("runs a pending batch cleanup when re-registering a listener", () => {
  const store = createStore({ count: 0, enabled: false });
  let active = 0;

  const listener = () => {
    active += 1;
    return () => {
      active -= 1;
    };
  };

  const first = batch(store, ["count"], listener);
  const second = batch(store, ["count", "enabled"], listener);

  expect(active).toBe(1);

  second();
  first();

  expect(active).toBe(0);
});

test("does not drain batch cleanups installed by re-registration cleanups", () => {
  const store = createStore({ count: 0 });
  const events: string[] = [];
  let active = 0;
  let runCount = 0;
  let registerFromCleanup = true;

  const listener = () => {
    active += 1;
    runCount += 1;
    const id = runCount;
    events.push(`run ${id}`);
    return () => {
      active -= 1;
      events.push(`cleanup ${id}`);
      if (!registerFromCleanup) return;
      registerFromCleanup = false;
      batch(store, ["count"], listener);
    };
  };

  const first = batch(store, ["count"], listener);
  const second = batch(store, ["count"], listener);

  expect(events).toEqual(["run 1", "cleanup 1", "run 2", "run 3"]);
  expect(active).toBe(2);

  second();
  expect(active).toBe(0);

  first();
  expect(active).toBe(0);
  expect(events).toEqual([
    "run 1",
    "cleanup 1",
    "run 2",
    "run 3",
    "cleanup 2",
    "cleanup 3",
  ]);
});

test("keeps batch re-registration cleanup updates out of the initial diff", async () => {
  const store = createStore({ count: 0, enabled: false });
  const changes: Array<[number, number]> = [];

  const listener = (state: { count: number }, prevState: { count: number }) => {
    if (state.count !== prevState.count) {
      changes.push([state.count, prevState.count]);
    }
    return () => {
      store.setState("count", (count) => (count === 0 ? count + 1 : count));
    };
  };

  const first = batch(store, ["count"], listener);
  changes.length = 0;

  const second = batch(store, ["count", "enabled"], listener);
  expect(changes).toEqual([]);

  await flushBatch();
  second();
  first();

  expect(changes).toEqual([[1, 0]]);
});

test("preserves pending batch diffs after re-registration cleanup updates another key", async () => {
  const store = createStore({ count: 0, enabled: false });
  const changes: Array<[number, number, boolean, boolean]> = [];

  const listener = (
    state: { count: number; enabled: boolean },
    prevState: { count: number; enabled: boolean },
  ) => {
    changes.push([
      state.count,
      prevState.count,
      state.enabled,
      prevState.enabled,
    ]);
    return () => {
      store.setState("enabled", true);
    };
  };

  const first = batch(store, ["count", "enabled"], listener);
  changes.length = 0;

  store.setState("count", 1);
  const second = batch(store, ["count", "enabled"], listener);

  expect(changes).toEqual([[1, 0, true, true]]);

  await flushBatch();
  second();
  first();

  expect(changes).toEqual([
    [1, 0, true, true],
    [1, 0, true, false],
  ]);
});

test("preserves re-registration cleanup updates for other batch listeners", async () => {
  const store = createStore({ count: 0, enabled: false });
  const changes: Array<[number, number]> = [];

  batch(store, ["count"], (state, prevState) => {
    changes.push([state.count, prevState.count]);
  });
  changes.length = 0;

  const listener = () => {
    return () => {
      store.setState("count", 1);
    };
  };

  const first = batch(store, ["enabled"], listener);
  const second = batch(store, ["count", "enabled"], listener);

  expect(changes).toEqual([]);

  await flushBatch();
  second();
  first();

  expect(changes).toEqual([[1, 0]]);
});

test("preserves pending same-key batch diffs after re-registration cleanup", async () => {
  const store = createStore({ count: 0 });
  const changes: Array<[number, number]> = [];

  const listener = (state: { count: number }, prevState: { count: number }) => {
    if (state.count !== prevState.count) {
      changes.push([state.count, prevState.count]);
    }
    return () => {
      store.setState("count", 2);
    };
  };

  const first = batch(store, ["count"], listener);
  changes.length = 0;

  store.setState("count", 1);
  const second = batch(store, ["count"], listener);

  expect(changes).toEqual([]);

  await flushBatch();
  second();
  first();

  expect(changes).toEqual([[2, 0]]);
});

test("registers a batch listener during dispatch and still sees the in-flight diff", async () => {
  const store = createStore({ count: 0, registered: false });
  const calls: Array<[number, number]> = [];

  sync(store, ["count"], (state) => {
    if (!state.count) return;
    if (store.getState().registered) return;
    store.setState("registered", true);
    batch(store, ["count"], (s, p) => {
      calls.push([s.count, p.count]);
    });
  });

  store.setState("count", 1);
  expect(calls).toEqual([[1, 0]]);

  await flushBatch();

  expect(calls).toEqual([
    [1, 0],
    [1, 0],
  ]);

  store.setState("count", 2);
  await flushBatch();

  expect(calls).toEqual([
    [1, 0],
    [1, 0],
    [2, 1],
  ]);
});

test("fires a re-keyed listener for the currently dispatched key", () => {
  const store = createStore({ count: 0 });
  const events: string[] = [];

  const second = () => {
    events.push("second");
  };

  subscribe(store, null, () => {
    events.push("first");
    subscribe(store, ["count"], second);
  });
  subscribe(store, null, second);

  store.setState("count", 1);

  expect(events).toEqual(["first", "second"]);
});

test("fires a keyed listener added during the keyed fast path", () => {
  const store = createStore({ count: 0 });
  const events: string[] = [];

  const second = () => {
    events.push("second");
  };

  subscribe(store, ["count"], () => {
    events.push("first");
    subscribe(store, ["count"], second);
  });

  store.setState("count", 1);

  expect(events).toEqual(["first", "second"]);
});

test("fires an all-keys listener added during the keyed fast path", () => {
  const store = createStore({ count: 0 });
  const events: string[] = [];

  const second = () => {
    events.push("second");
  };

  subscribe(store, ["count"], () => {
    events.push("first");
    subscribe(store, null, second);
  });

  store.setState("count", 1);

  expect(events).toEqual(["first", "second"]);
});

test("does not refire a keyed listener re-keyed to all keys", () => {
  const store = createStore({ count: 0 });
  const events: string[] = [];

  const listener = () => {
    events.push("listener");
    subscribe(store, null, listener);
  };

  subscribe(store, ["count"], listener);

  store.setState("count", 1);

  expect(events).toEqual(["listener"]);
});

test("does not refire an earlier listener re-keyed to all keys", () => {
  const store = createStore({ count: 0 });
  const events: string[] = [];

  const first = () => {
    events.push("first");
  };

  subscribe(store, ["count"], first);
  subscribe(store, ["count"], () => {
    events.push("second");
    subscribe(store, null, first);
  });

  store.setState("count", 1);

  expect(events).toEqual(["first", "second"]);
});

test("does not fire an earlier other-key listener re-keyed to all keys", () => {
  const getEvents = (forceSlowPath = false) => {
    const store = createStore({ count: 0, label: "" });
    const events: string[] = [];

    const first = () => {
      events.push("first");
    };

    if (forceSlowPath) {
      subscribe(store, null, () => {});
    }
    subscribe(store, ["label"], first);
    subscribe(store, ["count"], () => {
      events.push("second");
      subscribe(store, null, first);
    });

    store.setState("count", 1);

    return events;
  };

  expect(getEvents()).toEqual(["second"]);
  expect(getEvents(true)).toEqual(["second"]);
});

test("preserves listener order when all-keys listeners are added", () => {
  const getEvents = (forceSlowPath = false) => {
    const store = createStore({ count: 0 });
    const events: string[] = [];

    const third = () => {
      events.push("third");
    };

    const fourth = () => {
      events.push("fourth");
    };

    if (forceSlowPath) {
      subscribe(store, null, () => {});
    }
    subscribe(store, ["count"], () => {
      events.push("first");
      subscribe(store, null, third);
    });
    subscribe(store, ["count"], () => {
      events.push("second");
      subscribe(store, ["count"], fourth);
    });

    store.setState("count", 1);

    return events;
  };

  expect(getEvents()).toEqual(["first", "second", "third", "fourth"]);
  expect(getEvents(true)).toEqual(["first", "second", "third", "fourth"]);
});

test("continues after a keyed listener unsubscribes before recovery", () => {
  const store = createStore({ count: 0 });
  const events: string[] = [];
  let dispose = () => {};

  dispose = subscribe(store, ["count"], () => {
    events.push("first");
    dispose();
    subscribe(store, null, () => {
      events.push("third");
    });
  });
  subscribe(store, ["count"], () => {
    events.push("second");
  });

  store.setState("count", 1);

  expect(events).toEqual(["first", "second", "third"]);
});

test("fires a keyed listener added after the active bucket empties", () => {
  const getEvents = (forceSlowPath = false) => {
    const store = createStore({ count: 0 });
    const events: string[] = [];
    let dispose = () => {};

    const second = () => {
      events.push("second");
    };

    if (forceSlowPath) {
      subscribe(store, null, () => {});
    }
    dispose = subscribe(store, ["count"], () => {
      events.push("first");
      dispose();
      subscribe(store, ["count"], second);
    });

    store.setState("count", 1);

    return events;
  };

  expect(getEvents()).toEqual(["first", "second"]);
  expect(getEvents(true)).toEqual(["first", "second"]);
});

test("fires a current-key listener re-keyed before recovery", () => {
  const store = createStore({ count: 0, label: "" });
  const events: string[] = [];

  const first = () => {
    events.push("first");
  };

  subscribe(store, ["label"], first);
  subscribe(store, ["count"], () => {
    events.push("second");
    subscribe(store, null, () => {
      events.push("third");
    });
  });
  subscribe(store, ["count"], first);

  store.setState("count", 1);

  expect(events).toEqual(["second", "first", "third"]);
});

test("does not refire an earlier listener re-keyed to the current key", () => {
  const getEvents = (forceSlowPath = false) => {
    const store = createStore({ count: 0 });
    const events: string[] = [];

    const first = () => {
      events.push("first");
    };

    if (forceSlowPath) {
      subscribe(store, null, () => {});
    }
    subscribe(store, ["count"], first);
    subscribe(store, ["count"], () => {
      events.push("second");
      subscribe(store, ["count"], first);
    });

    store.setState("count", 1);

    return events;
  };

  expect(getEvents()).toEqual(["first", "second"]);
  expect(getEvents(true)).toEqual(["first", "second"]);
});

test("preserves order when a pending listener re-keys to current key", () => {
  const getEvents = (forceSlowPath = false) => {
    const store = createStore({ count: 0 });
    const events: string[] = [];

    const second = () => {
      events.push("second");
    };

    if (forceSlowPath) {
      subscribe(store, null, () => {});
    }
    subscribe(store, ["count"], () => {
      events.push("first");
      subscribe(store, ["count"], second);
    });
    subscribe(store, ["count"], second);
    subscribe(store, ["count"], () => {
      events.push("third");
    });

    store.setState("count", 1);

    return events;
  };

  expect(getEvents()).toEqual(["first", "second", "third"]);
  expect(getEvents(true)).toEqual(["first", "second", "third"]);
});

test("fires a keyed listener freshly re-subscribed after unsubscribe", () => {
  const getEvents = (forceSlowPath = false) => {
    const store = createStore({ count: 0 });
    const events: string[] = [];
    let dispose = () => {};

    const listener = () => {
      events.push("listener");
      dispose();
      if (events.length === 1) {
        subscribe(store, ["count"], listener);
      }
    };

    if (forceSlowPath) {
      subscribe(store, null, () => {});
    }
    dispose = subscribe(store, ["count"], listener);

    store.setState("count", 1);

    return events;
  };

  expect(getEvents()).toEqual(["listener", "listener"]);
  expect(getEvents(true)).toEqual(["listener", "listener"]);
});

test("fires an all-keys listener freshly re-subscribed after unsubscribe", () => {
  const getEvents = (forceSlowPath = false) => {
    const store = createStore({ count: 0 });
    const events: string[] = [];
    let dispose = () => {};

    const listener = () => {
      events.push("listener");
      dispose();
      if (events.length === 1) {
        subscribe(store, null, listener);
      }
    };

    if (forceSlowPath) {
      subscribe(store, null, () => {});
    }
    dispose = subscribe(store, ["count"], listener);

    store.setState("count", 1);

    return events;
  };

  expect(getEvents()).toEqual(["listener", "listener"]);
  expect(getEvents(true)).toEqual(["listener", "listener"]);
});

test("does not fire an earlier other-key listener re-keyed to current key", () => {
  const getEvents = (forceSlowPath = false) => {
    const store = createStore({ count: 0, label: "" });
    const events: string[] = [];

    const first = () => {
      events.push("first");
    };

    if (forceSlowPath) {
      subscribe(store, null, () => {});
    }
    subscribe(store, ["label"], first);
    subscribe(store, ["count"], () => {
      events.push("second");
      subscribe(store, ["count"], first);
    });

    store.setState("count", 1);

    return events;
  };

  expect(getEvents()).toEqual(["second"]);
  expect(getEvents(true)).toEqual(["second"]);
});

test("fires a pending keyed listener re-keyed to all keys", () => {
  const store = createStore({ count: 0, label: "" });
  const events: string[] = [];

  const first = () => {
    events.push("first");
  };

  subscribe(store, ["label"], first);
  subscribe(store, ["count"], () => {
    events.push("second");
    subscribe(store, null, first);
  });
  subscribe(store, ["count"], first);

  store.setState("count", 1);

  expect(events).toEqual(["second", "first"]);
});

test("does not refire keyed listeners before self-unsubscribe recovery", () => {
  const getEvents = (forceSlowPath = false) => {
    const store = createStore({ count: 0 });
    const events: string[] = [];
    let dispose = () => {};

    if (forceSlowPath) {
      subscribe(store, null, () => {});
    }
    subscribe(store, ["count"], () => {
      events.push("first");
    });
    dispose = subscribe(store, ["count"], () => {
      events.push("second");
      dispose();
      subscribe(store, null, () => {
        events.push("third");
      });
    });

    store.setState("count", 1);

    return events;
  };

  expect(getEvents()).toEqual(["first", "second", "third"]);
  expect(getEvents(true)).toEqual(["first", "second", "third"]);
});

test("continues after the current listener re-keys before recovery", () => {
  const getEvents = (forceSlowPath = false) => {
    const store = createStore({ count: 0, label: "" });
    const events: string[] = [];

    const first = () => {
      events.push("first");
      subscribe(store, ["label"], first);
      subscribe(store, null, () => {
        events.push("fourth");
      });
    };

    if (forceSlowPath) {
      subscribe(store, null, () => {});
    }
    subscribe(store, ["count"], first);
    subscribe(store, ["count"], () => {
      events.push("second");
    });
    subscribe(store, ["count"], () => {
      events.push("third");
    });

    store.setState("count", 1);

    return events;
  };

  expect(getEvents()).toEqual(["first", "second", "third", "fourth"]);
  expect(getEvents(true)).toEqual(["first", "second", "third", "fourth"]);
});

test("continues after the current listener unsubscribes before re-keying", () => {
  const getEvents = (forceSlowPath = false) => {
    const store = createStore({ count: 0, label: "" });
    const events: string[] = [];
    let dispose = () => {};

    const second = () => {
      events.push("second");
    };

    if (forceSlowPath) {
      subscribe(store, null, () => {});
    }
    dispose = subscribe(store, ["count"], () => {
      events.push("first");
      dispose();
      subscribe(store, null, second);
    });
    subscribe(store, ["label"], second);

    store.setState("count", 1);

    return events;
  };

  expect(getEvents()).toEqual(["first", "second"]);
  expect(getEvents(true)).toEqual(["first", "second"]);
});

test("does not fire earlier listener re-keyed after current unsubscribe", () => {
  const getEvents = (forceSlowPath = false) => {
    const store = createStore({ count: 0, label: "" });
    const events: string[] = [];
    let dispose = () => {};

    const first = () => {
      events.push("first");
    };

    if (forceSlowPath) {
      subscribe(store, null, () => {});
    }
    subscribe(store, ["label"], first);
    dispose = subscribe(store, ["count"], () => {
      events.push("second");
      dispose();
      subscribe(store, null, first);
    });

    store.setState("count", 1);

    return events;
  };

  expect(getEvents()).toEqual(["second"]);
  expect(getEvents(true)).toEqual(["second"]);
});

test("fires a recovered listener freshly re-subscribed after unsubscribe", () => {
  const getEvents = (forceSlowPath = false) => {
    const store = createStore({ count: 0 });
    const events: string[] = [];
    let dispose = () => {};

    const second = () => {
      events.push("second");
      dispose();
      if (events.length === 2) {
        dispose = subscribe(store, null, second);
      }
    };

    if (forceSlowPath) {
      subscribe(store, null, () => {});
    }
    subscribe(store, ["count"], () => {
      events.push("first");
      dispose = subscribe(store, null, second);
    });

    store.setState("count", 1);

    return events;
  };

  expect(getEvents()).toEqual(["first", "second", "second"]);
  expect(getEvents(true)).toEqual(["first", "second", "second"]);
});

test("keeps outer recovery state during reentrant dispatch", () => {
  const getEvents = (forceSlowPath = false) => {
    const store = createStore({ count: 0, label: "", nested: 0 });
    const events: string[] = [];

    const first = () => {
      events.push("first");
    };

    if (forceSlowPath) {
      subscribe(store, null, () => {});
    }
    subscribe(store, ["label"], first);
    subscribe(store, ["count"], () => {
      events.push("second");
      store.setState("nested", 1);
    });
    subscribe(store, ["nested"], () => {
      events.push("nested");
      subscribe(store, null, first);
    });

    store.setState("count", 1);

    return events;
  };

  expect(getEvents()).toEqual(["second", "nested"]);
  expect(getEvents(true)).toEqual(["second", "nested"]);
});

test("uses live state after reentrant recovered listeners", () => {
  const getEvents = (forceSlowPath = false) => {
    const store = createStore({ count: 0, label: "a" });
    const events: string[] = [];
    let updated = false;

    const first = (state: { label: string }) => {
      events.push(`first:${state.label}`);
      if (!updated) {
        updated = true;
        store.setState("label", "b");
      }
    };

    const second = (state: { label: string }) => {
      events.push(`second:${state.label}`);
    };

    if (forceSlowPath) {
      subscribe(store, null, () => {});
    }
    subscribe(store, ["count"], () => {
      events.push("keyed");
      subscribe(store, null, first);
      subscribe(store, null, second);
    });

    store.setState("count", 1);

    return events;
  };

  expect(getEvents()).toEqual([
    "keyed",
    "first:a",
    "first:b",
    "second:b",
    "second:b",
  ]);
  expect(getEvents(true)).toEqual([
    "keyed",
    "first:a",
    "first:b",
    "second:b",
    "second:b",
  ]);
});

test("fires a keyed listener added by an all-keys listener", () => {
  const store = createStore({ count: 0 });
  const events: string[] = [];

  const third = () => {
    events.push("third");
  };

  const second = () => {
    events.push("second");
    subscribe(store, ["count"], third);
  };

  subscribe(store, ["count"], () => {
    events.push("first");
    subscribe(store, null, second);
  });

  store.setState("count", 1);

  expect(events).toEqual(["first", "second", "third"]);
});

test("unsubscribes a keyed listener from inside another keyed listener", () => {
  const store = createStore({ count: 0 });
  const events: string[] = [];
  let dispose = () => {};

  sync(store, ["count"], (state) => {
    events.push(`outer ${state.count}`);
    dispose();
  });

  dispose = subscribe(store, ["count"], (state) => {
    events.push(`inner ${state.count}`);
  });

  store.setState("count", 1);

  expect(events).toEqual(["outer 0", "outer 1"]);
});

test("syncs reentrant parent setStates during a child's initial push", () => {
  const parent = createStore({ a: "parent-a", b: "parent-b" });
  const child = createStore({ a: "child-a", b: "child-b", c: "c" }, parent);

  sync(child, ["a"], (state) => {
    if (state.a === "parent-a") {
      parent.setState("b", "updated-b");
    }
  });

  const cleanup = init(child);

  expect(child.getState()).toEqual({
    a: "parent-a",
    b: "updated-b",
    c: "c",
  });
  expect(parent.getState()).toEqual({ a: "parent-a", b: "updated-b" });

  cleanup();
});

test("syncs reentrant parent setStates to an earlier key during a child's initial push", () => {
  const parent = createStore({ a: "parent-a", b: "parent-b" });
  const child = createStore({ a: "child-a", b: "child-b" }, parent);

  sync(child, ["b"], (state) => {
    if (state.b === "parent-b") {
      parent.setState("a", "updated-a");
    }
  });

  const cleanup = init(child);

  expect(child.getState()).toEqual({
    a: "updated-a",
    b: "parent-b",
  });
  expect(parent.getState()).toEqual({ a: "updated-a", b: "parent-b" });

  cleanup();
});

test("syncs reentrant multi-parent setStates during a child's initial push", () => {
  const first = createStore({ a: "first-a", b: "first-b" });
  const second = createStore({ c: "second-c" });
  const child = createStore(
    { a: "child-a", b: "child-b", c: "child-c" },
    first,
    second,
  );

  sync(child, ["a"], (state) => {
    if (state.a === "first-a") {
      first.setState("b", "updated-b");
    }
  });

  const cleanup = init(child);

  expect(child.getState()).toEqual({
    a: "first-a",
    b: "updated-b",
    c: "second-c",
  });
  expect(first.getState()).toEqual({ a: "first-a", b: "updated-b" });
  expect(second.getState()).toEqual({ c: "second-c" });

  cleanup();
});

test("syncs reentrant multi-parent setStates to an earlier key during a child's initial push", () => {
  const first = createStore({ a: "first-a", b: "first-b" });
  const second = createStore({ c: "second-c" });
  const child = createStore(
    { a: "child-a", b: "child-b", c: "child-c" },
    first,
    second,
  );

  sync(child, ["b"], (state) => {
    if (state.b === "first-b") {
      first.setState("a", "updated-a");
    }
  });

  const cleanup = init(child);

  expect(child.getState()).toEqual({
    a: "updated-a",
    b: "first-b",
    c: "second-c",
  });
  expect(first.getState()).toEqual({ a: "updated-a", b: "first-b" });
  expect(second.getState()).toEqual({ c: "second-c" });

  cleanup();
});

test("fires a sync listener registered on the parent after init with the child already updated", () => {
  const parent = createStore({ count: 0 });
  const child = createStore({ count: 0 }, parent);

  const cleanup = init(child);

  const calls: number[] = [];
  const unsubscribe = sync(parent, ["count"], () => {
    calls.push(child.getState().count);
  });

  parent.setState("count", 1);
  expect(calls).toEqual([0, 1]);

  unsubscribe();
  cleanup();
});

test("keeps the batch baseline current across idle setStates between subscriptions", async () => {
  const store = createStore({ count: 0 });

  // Prime prevStateBatch via a first subscription + flush, then unsubscribe.
  const firstUnsubscribe = batch(store, ["count"], () => {});
  store.setState("count", 1);
  await flushBatch();
  firstUnsubscribe();

  // Idle setStates while no batch listeners are registered.
  store.setState("count", 2);
  store.setState("count", 3);

  // Register a new batch listener mid-dispatch. The listener registered
  // here must see (4, 3) — not (4, 1) — as its initial diff, even though
  // the idle setStates produced no batch microtask.
  const laterCalls: Array<[number, number]> = [];
  let registered = false;
  sync(store, ["count"], (state) => {
    if (registered) return;
    if (state.count !== 4) return;
    registered = true;
    batch(store, ["count"], (s, p) => {
      laterCalls.push([s.count, p.count]);
    });
  });

  store.setState("count", 4);

  expect(laterCalls).toEqual([[4, 3]]);
});

test("keeps the batch baseline current when a batch listener unsubscribes itself and setStates mid-flush", async () => {
  const store = createStore({ count: 0 });

  let firstUnsub = () => {};
  firstUnsub = batch(store, ["count"], (state) => {
    if (state.count === 1) {
      firstUnsub();
      store.setState("count", 2);
    }
  });

  store.setState("count", 1);
  await flushBatch();

  expect(store.getState().count).toBe(2);

  const laterCalls: Array<[number, number]> = [];
  let registered = false;
  sync(store, ["count"], (state) => {
    if (registered) return;
    if (state.count !== 3) return;
    registered = true;
    batch(store, ["count"], (s, p) => {
      laterCalls.push([s.count, p.count]);
    });
  });

  store.setState("count", 3);

  // The new batch listener registered mid-dispatch must see [3, 2] — the
  // diff from the post-flush state, not the pre-flush snapshot ([3, 1]).
  expect(laterCalls).toEqual([[3, 2]]);
});

test("keeps the batch baseline current when the only batch listener unsubscribes itself mid-flush", async () => {
  const store = createStore({ count: 0 });

  let firstUnsub = () => {};
  firstUnsub = batch(store, ["count"], () => {
    firstUnsub();
  });

  store.setState("count", 1);
  await flushBatch();

  const laterCalls: Array<[number, number]> = [];
  let registered = false;
  sync(store, ["count"], (state) => {
    if (registered) return;
    if (state.count !== 2) return;
    registered = true;
    batch(store, ["count"], (s, p) => {
      laterCalls.push([s.count, p.count]);
    });
  });

  store.setState("count", 2);

  // The new batch listener registered mid-dispatch must see [2, 1] — the
  // diff from the post-flush state, not the pre-flush snapshot ([2, 0]).
  expect(laterCalls).toEqual([[2, 1]]);
});

test("keeps the batch baseline current when a batch listener registers a successor mid-flush", async () => {
  const store = createStore({ count: 0 });
  const laterCalls: Array<[number, number]> = [];

  let firstUnsub = () => {};
  firstUnsub = batch(store, ["count"], (state) => {
    if (state.count !== 1) return;
    firstUnsub();
    store.setState("count", 2);
    batch(store, ["count"], (s, p) => {
      laterCalls.push([s.count, p.count]);
    });
  });

  store.setState("count", 1);
  await flushBatch();

  store.setState("count", 3);
  await flushBatch();

  // The successor batch listener was registered when state was {count: 2},
  // so the next flush must diff against that baseline, not the pre-flush
  // snapshot from the original listener's flush ({count: 1}).
  const lastCall = laterCalls.at(-1);
  expect(lastCall).toEqual([3, 2]);
});

test("runs setup callbacks during init and tears down after the last cleanup", () => {
  const store = createStore({ count: 0 });
  const events: string[] = [];

  const removeSetup = setup(store, () => {
    events.push("setup");
    return () => events.push("teardown");
  });

  expect(events).toEqual([]);

  const cleanupA = init(store);
  const cleanupB = init(store);

  expect(events).toEqual(["setup"]);

  cleanupA();
  expect(events).toEqual(["setup"]);

  cleanupB();
  expect(events).toEqual(["setup", "teardown"]);

  const cleanupC = init(store);
  cleanupC();

  expect(events).toEqual(["setup", "teardown", "setup", "teardown"]);

  removeSetup();

  const cleanupD = init(store);
  cleanupD();

  expect(events).toEqual(["setup", "teardown", "setup", "teardown"]);
});

test("does not rerun setup teardowns from stale init cleanups", () => {
  const store = createStore({ count: 0 });
  const events: string[] = [];

  setup(store, () => {
    events.push("setup");
    return () => events.push("teardown");
  });

  const cleanupA = init(store);
  const cleanupB = init(store);

  expect(events).toEqual(["setup"]);

  cleanupA();
  cleanupB();
  cleanupA();
  cleanupB();

  expect(events).toEqual(["setup", "teardown"]);
});

test("keeps extended stores in sync while initialized", () => {
  const parent = createStore({
    count: 0,
    label: "parent",
    parentOnly: true,
  });
  const child = createStore(
    { count: 10, label: "child", childOnly: true },
    parent,
  );

  parent.setState("count", 1);
  parent.setState("label", "latest parent");

  const cleanup = init(child);

  expect(child.getState()).toEqual({
    count: 1,
    label: "latest parent",
    childOnly: true,
  });

  parent.setState("label", "updated parent");
  expect(child.getState().label).toBe("updated parent");

  child.setState("count", 2);
  expect(parent.getState().count).toBe(2);

  cleanup();

  parent.setState("count", 3);
  expect(child.getState().count).toBe(2);
});

test("keeps a shared parent initialized until every child is cleaned up", () => {
  const parent = createStore({ count: 0 });
  const events: string[] = [];

  setup(parent, () => {
    events.push("setup");
    return () => events.push("teardown");
  });

  const childA = createStore({ count: 0 }, parent);
  const childB = createStore({ count: 0 }, parent);

  const cleanupA = init(childA);
  const cleanupB = init(childB);

  expect(events).toEqual(["setup"]);

  cleanupA();
  expect(events).toEqual(["setup"]);

  parent.setState("count", 1);
  expect(childA.getState().count).toBe(0);
  expect(childB.getState().count).toBe(1);

  cleanupB();
  expect(events).toEqual(["setup", "teardown"]);
});

test("initializes extended stores with argument-order precedence", () => {
  const first = createStore({ count: 1 });
  const second = createStore({ count: 2 });
  const child = createStore({ count: 0 }, first, second);

  const cleanup = init(child);

  expect(child.getState().count).toBe(2);

  first.setState("count", 3);
  expect(child.getState().count).toBe(3);

  second.setState("count", 4);
  expect(child.getState().count).toBe(4);

  child.setState("count", 5);
  expect(first.getState().count).toBe(5);
  expect(second.getState().count).toBe(5);

  cleanup();
});

test("notifies initialized child listeners once for shared local updates", () => {
  const first = createStore({ count: 0 });
  const second = createStore({ count: 0 });
  const child = createStore({ count: 0 }, first, second);

  const cleanup = init(child);
  const subscribeCalls: Array<[number, number]> = [];
  const syncCalls: Array<[number, number]> = [];
  const subscribeParentCounts: Array<[number, number]> = [];
  const syncParentCounts: Array<[number, number]> = [];
  const firstParentChildCounts: number[] = [];
  const secondParentChildCounts: number[] = [];

  const unsubscribeSubscribe = subscribe(
    child,
    ["count"],
    (state, prevState) => {
      subscribeCalls.push([state.count, prevState.count]);
      subscribeParentCounts.push([
        first.getState().count,
        second.getState().count,
      ]);
    },
  );
  const unsubscribeSync = sync(child, ["count"], (state, prevState) => {
    syncCalls.push([state.count, prevState.count]);
    syncParentCounts.push([first.getState().count, second.getState().count]);
  });
  const unsubscribeFirstParent = sync(first, ["count"], (state) => {
    if (state.count === 0) return;
    firstParentChildCounts.push(child.getState().count);
  });
  const unsubscribeSecondParent = sync(second, ["count"], (state) => {
    if (state.count === 0) return;
    secondParentChildCounts.push(child.getState().count);
  });

  expect(syncCalls).toEqual([[0, 0]]);
  syncCalls.length = 0;
  syncParentCounts.length = 0;

  child.setState("count", 1);

  expect(child.getState().count).toBe(1);
  expect(first.getState().count).toBe(1);
  expect(second.getState().count).toBe(1);
  expect(subscribeCalls).toEqual([[1, 0]]);
  expect(syncCalls).toEqual([[1, 0]]);
  expect(subscribeParentCounts).toEqual([[1, 1]]);
  expect(syncParentCounts).toEqual([[1, 1]]);
  expect(firstParentChildCounts).toEqual([1]);
  expect(secondParentChildCounts).toEqual([1]);

  unsubscribeSubscribe();
  unsubscribeSync();
  unsubscribeFirstParent();
  unsubscribeSecondParent();
  cleanup();
});

test("keeps child batch diff for listeners registered during parent fan-out", async () => {
  const parent = createStore({ count: 0 });
  const child = createStore({ count: 0 }, parent);

  const cleanup = init(child);
  const calls: Array<[number, number]> = [];
  let unsubscribeBatch = () => {};
  let registered = false;

  const unsubscribeParent = sync(parent, ["count"], (state) => {
    if (state.count === 0) return;
    if (registered) return;
    registered = true;
    unsubscribeBatch = batch(child, ["count"], (state, prevState) => {
      calls.push([state.count, prevState.count]);
    });
  });

  child.setState("count", 1);

  expect(calls).toEqual([[1, 0]]);

  await flushBatch();

  expect(calls).toEqual([
    [1, 0],
    [1, 0],
  ]);

  unsubscribeBatch();
  unsubscribeParent();
  cleanup();
});

test("preserves nested child updates in prevState after parent fan-out", () => {
  const parent = createStore({ a: "0", b: "0" });
  const child = createStore({ a: "0", b: "0" }, parent);

  const cleanup = init(child);
  const calls: Array<{
    state: { a: string; b: string };
    prevState: { a: string; b: string };
  }> = [];

  const unsubscribeChild = sync(child, ["a", "b"], (state, prevState) => {
    calls.push({
      state: { a: state.a, b: state.b },
      prevState: { a: prevState.a, b: prevState.b },
    });
  });
  const unsubscribeParent = sync(parent, ["a"], (state) => {
    if (state.a !== "1") return;
    if (child.getState().b === "1") return;
    child.setState("b", "1");
  });

  calls.length = 0;

  child.setState("a", "1");

  expect(calls).toEqual([
    {
      state: { a: "1", b: "1" },
      prevState: { a: "1", b: "0" },
    },
    {
      state: { a: "1", b: "1" },
      prevState: { a: "0", b: "1" },
    },
  ]);

  unsubscribeChild();
  unsubscribeParent();
  cleanup();
});

test("skips superseded same-key child notifications after parent fan-out", () => {
  const first = createStore({ count: 0 });
  const second = createStore({ count: 0 });
  const child = createStore({ count: 0 }, first, second);

  const cleanup = init(child);
  const calls: Array<[number, number]> = [];

  const unsubscribeChild = sync(child, ["count"], (state, prevState) => {
    if (state.count === 0) return;
    calls.push([state.count, prevState.count]);
  });
  const unsubscribeParent = sync(first, ["count"], (state) => {
    if (state.count !== 1) return;
    if (child.getState().count !== 1) return;
    child.setState("count", 2);
  });

  calls.length = 0;

  child.setState("count", 1);

  expect(child.getState().count).toBe(2);
  expect(first.getState().count).toBe(2);
  expect(second.getState().count).toBe(2);
  expect(calls).toEqual([[2, 1]]);

  unsubscribeChild();
  unsubscribeParent();
  cleanup();
});

test("keeps parent stores in sync after parent-driven supersede", () => {
  const first = createStore({ count: 0 });
  const second = createStore({ count: 0 });
  const child = createStore({ count: 0 }, first, second);

  const cleanup = init(child);
  const unsubscribeFirst = sync(first, ["count"], (state) => {
    if (state.count <= 5) return;
    first.setState("count", 5);
  });

  child.setState("count", 10);

  expect(child.getState().count).toBe(5);
  expect(first.getState().count).toBe(5);
  expect(second.getState().count).toBe(5);

  unsubscribeFirst();
  cleanup();
});

test("keeps earlier parent stores in sync after later parent supersede", () => {
  const first = createStore({ count: 0 });
  const second = createStore({ count: 0 });
  const child = createStore({ count: 0 }, first, second);

  const cleanup = init(child);
  const unsubscribeSecond = sync(second, ["count"], (state) => {
    if (state.count <= 5) return;
    second.setState("count", 5);
  });

  child.setState("count", 10);

  expect(child.getState().count).toBe(5);
  expect(first.getState().count).toBe(5);
  expect(second.getState().count).toBe(5);

  unsubscribeSecond();
  cleanup();
});

test("keeps parent stores in sync after cascading parent supersede", () => {
  const first = createStore({ count: 0 });
  const second = createStore({ count: 0 });
  const child = createStore({ count: 0 }, first, second);

  const cleanup = init(child);
  const unsubscribeFirst = sync(first, ["count"], (state) => {
    if (state.count !== 5) return;
    first.setState("count", 4);
  });
  const unsubscribeSecond = sync(second, ["count"], (state) => {
    if (state.count <= 5) return;
    second.setState("count", 5);
  });

  child.setState("count", 10);

  expect(child.getState().count).toBe(4);
  expect(first.getState().count).toBe(4);
  expect(second.getState().count).toBe(4);

  unsubscribeFirst();
  unsubscribeSecond();
  cleanup();
});

test("restarts parent repair after later parent supersede", () => {
  const first = createStore({ count: 0 });
  const second = createStore({ count: 0 });
  const child = createStore({ count: 0 }, first, second);

  const cleanup = init(child);
  const unsubscribeFirst = sync(first, ["count"], (state) => {
    if (state.count <= 5) return;
    first.setState("count", 5);
  });
  const unsubscribeSecond = sync(second, ["count"], (state) => {
    if (state.count !== 5) return;
    second.setState("count", 4);
  });

  child.setState("count", 10);

  expect(child.getState().count).toBe(4);
  expect(first.getState().count).toBe(4);
  expect(second.getState().count).toBe(4);

  unsubscribeFirst();
  unsubscribeSecond();
  cleanup();
});

test("continues parent repair after finite cascades", () => {
  const first = createStore({ count: 0 });
  const second = createStore({ count: 0 });
  const child = createStore({ count: 0 }, first, second);

  const cleanup = init(child);
  const unsubscribeFirst = sync(first, ["count"], (state) => {
    if (state.count === 5) {
      first.setState("count", 2);
    } else if (state.count === 3) {
      first.setState("count", 1);
    }
  });
  const unsubscribeSecond = sync(second, ["count"], (state) => {
    if (state.count === 10) {
      second.setState("count", 5);
    } else if (state.count === 2) {
      second.setState("count", 3);
    } else if (state.count === 1) {
      second.setState("count", 0);
    }
  });

  child.setState("count", 10);

  expect(child.getState().count).toBe(0);
  expect(first.getState().count).toBe(0);
  expect(second.getState().count).toBe(0);

  unsubscribeFirst();
  unsubscribeSecond();
  cleanup();
});

test("continues parent repair after one-shot cycles", () => {
  const first = createStore({ count: 0 });
  const second = createStore({ count: 0 });
  const child = createStore({ count: 0 }, first, second);

  const cleanup = init(child);
  let didRewriteFirst = false;
  let didRewriteSecond = false;
  const unsubscribeFirst = sync(first, ["count"], (state) => {
    if (state.count !== 5) return;
    if (didRewriteFirst) return;
    didRewriteFirst = true;
    first.setState("count", 4);
  });
  const unsubscribeSecond = sync(second, ["count"], (state) => {
    if (state.count === 10) {
      second.setState("count", 5);
    } else if (state.count === 4 && !didRewriteSecond) {
      didRewriteSecond = true;
      second.setState("count", 5);
    }
  });

  child.setState("count", 10);

  expect(child.getState().count).toBe(5);
  expect(first.getState().count).toBe(5);
  expect(second.getState().count).toBe(5);

  unsubscribeFirst();
  unsubscribeSecond();
  cleanup();
});

test("warns when parent repair does not converge", () => {
  const first = createStore({ count: 0 });
  const second = createStore({ count: 0 });
  const child = createStore({ count: 0 }, first, second);
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

  const cleanup = init(child);
  const unsubscribeFirst = sync(first, ["count"], (state) => {
    if (state.count === 1) return;
    first.setState("count", 1);
  });
  const unsubscribeSecond = sync(second, ["count"], (state) => {
    if (state.count === 2) return;
    second.setState("count", 2);
  });

  child.setState("count", 10);

  expect(warn).toHaveBeenCalledOnce();
  expect(warn).toHaveBeenLastCalledWith(
    "Parent stores did not converge after a superseded fan-out; " +
      "a parent listener may be rewriting this key in a cycle.",
  );
  expect(child.getState().count).toBe(2);
  expect(first.getState().count).toBe(1);
  expect(second.getState().count).toBe(2);

  warn.mockRestore();
  unsubscribeFirst();
  unsubscribeSecond();
  cleanup();
});

test("does not warn when parent repair does not converge in production", () => {
  const first = createStore({ count: 0 });
  const second = createStore({ count: 0 });
  const child = createStore({ count: 0 }, first, second);
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

  vi.stubEnv("NODE_ENV", "production");

  const cleanup = init(child);
  const unsubscribeFirst = sync(first, ["count"], (state) => {
    if (state.count === 1) return;
    first.setState("count", 1);
  });
  const unsubscribeSecond = sync(second, ["count"], (state) => {
    if (state.count === 2) return;
    second.setState("count", 2);
  });

  child.setState("count", 10);

  expect(warn).not.toHaveBeenCalled();
  expect(child.getState().count).toBe(2);
  expect(first.getState().count).toBe(1);
  expect(second.getState().count).toBe(2);

  warn.mockRestore();
  unsubscribeFirst();
  unsubscribeSecond();
  cleanup();
});

test("refreshes child batch baseline after superseded same-key fan-out", async () => {
  const parent = createStore({ count: 0 });
  const child = createStore({ count: 0 }, parent);

  const cleanup = init(child);
  const calls: Array<[number, number]> = [];
  let unsubscribeBatch = () => {};
  let didSupersede = false;
  let didRegister = false;

  const unsubscribeParent = sync(parent, ["count"], (state) => {
    if (state.count === 1 && !didSupersede) {
      didSupersede = true;
      child.setState("count", 2);
    }
    if (state.count === 3 && !didRegister) {
      didRegister = true;
      unsubscribeBatch = batch(child, ["count"], (state, prevState) => {
        calls.push([state.count, prevState.count]);
      });
    }
  });

  child.setState("count", 1);

  expect(child.getState().count).toBe(2);

  child.setState("count", 3);

  expect(calls).toEqual([[3, 2]]);

  await flushBatch();

  expect(calls).toEqual([
    [3, 2],
    [3, 2],
  ]);

  unsubscribeBatch();
  unsubscribeParent();
  cleanup();
});

test("fans out NaN values to all parent stores", () => {
  const first = createStore({ count: 0 });
  const second = createStore({ count: 0 });
  const child = createStore({ count: 0 }, first, second);

  const cleanup = init(child);
  const calls: Array<[number, number]> = [];

  const unsubscribeChild = sync(child, ["count"], (state, prevState) => {
    calls.push([state.count, prevState.count]);
  });

  calls.length = 0;

  child.setState("count", Number.NaN);

  expect(Number.isNaN(child.getState().count)).toBe(true);
  expect(Number.isNaN(first.getState().count)).toBe(true);
  expect(Number.isNaN(second.getState().count)).toBe(true);
  expect(calls).toHaveLength(1);
  expect(Number.isNaN(calls[0]?.[0])).toBe(true);
  expect(calls[0]?.[1]).toBe(0);

  unsubscribeChild();
  cleanup();
});

test("keeps partial extended stores in sync while initialized", () => {
  const first = createStore({ first: "first", shared: "first" });
  const second = createStore({ shared: "second" });
  const child = createStore(
    { first: "child", shared: "child", child: "child" },
    first,
    second,
  );

  const cleanup = init(child);

  expect(child.getState()).toEqual({
    first: "first",
    shared: "second",
    child: "child",
  });

  first.setState("first", "updated first");
  expect(child.getState().first).toBe("updated first");

  first.setState("shared", "updated first shared");
  expect(child.getState().shared).toBe("updated first shared");

  second.setState("shared", "updated second shared");
  expect(child.getState().shared).toBe("updated second shared");

  child.setState("first", "updated child first");
  child.setState("shared", "updated child shared");

  expect(first.getState()).toEqual({
    first: "updated child first",
    shared: "updated child shared",
  });
  expect(second.getState()).toEqual({ shared: "updated child shared" });

  cleanup();
});

test("creates live picked and omitted stores", () => {
  const store = createStore({
    count: 0,
    label: "label",
    open: false,
  });
  const pickedStore = pick(store, ["count", "open"]);
  const omittedStore = omit(store, ["label"]);

  expect(pickedStore.getState()).toEqual({ count: 0, open: false });
  expect(omittedStore.getState()).toEqual({ count: 0, open: false });

  const cleanupPicked = init(pickedStore);
  const cleanupOmitted = init(omittedStore);

  store.setState("count", 1);

  expect(pickedStore.getState()).toEqual({ count: 1, open: false });
  expect(omittedStore.getState()).toEqual({ count: 1, open: false });

  pickedStore.setState("open", true);

  expect(store.getState().open).toBe(true);
  expect(omittedStore.getState().open).toBe(true);

  store.setState("label", "updated");

  expect(pickedStore.getState()).toEqual({ count: 1, open: true });
  expect(omittedStore.getState()).toEqual({ count: 1, open: true });

  cleanupPicked();
  cleanupOmitted();
});

test("merges stores with argument-order precedence", () => {
  interface MergedState {
    count?: number;
    label?: string;
    open?: boolean;
  }

  const first = Object.assign(
    createStore<MergedState>({ count: 0, label: "first" }),
    { custom: () => "custom" },
  );
  const second = createStore<MergedState>({ count: 1, open: false });
  const merged = mergeStore(first, undefined, second) as Store<MergedState> & {
    custom(): string;
  };

  expect(merged.getState()).toEqual({
    count: 1,
    label: "first",
    open: false,
  });
  expect(merged.custom()).toBe("custom");

  const cleanup = init(merged);

  second.setState("count", 2);
  expect(merged.getState().count).toBe(2);

  merged.setState("label", "merged");
  expect(first.getState().label).toBe("merged");

  merged.setState("open", true);
  expect(second.getState().open).toBe(true);

  cleanup();
});

test("throws on conflicting default props in development", () => {
  const store = createStore({ value: "Apple", open: false });

  expect(() =>
    throwOnConflictingProps({ defaultValue: "Orange" }, store),
  ).toThrow("Passing a store prop in conjunction with a default state");

  expect(() => throwOnConflictingProps({ defaultOpen: null }, store)).toThrow(
    "Passing a store prop in conjunction with a default state",
  );

  expect(() =>
    throwOnConflictingProps({ defaultValue: undefined }, store),
  ).not.toThrow();

  expect(() =>
    throwOnConflictingProps({ defaultMissing: true }, store),
  ).not.toThrow();

  expect(() =>
    throwOnConflictingProps({ defaultValue: "Orange" }),
  ).not.toThrow();
});

test("does not throw on conflicting default props in production", () => {
  const store = createStore({ value: "Apple" });

  vi.stubEnv("NODE_ENV", "production");

  expect(() =>
    throwOnConflictingProps({ defaultValue: "Orange" }, store),
  ).not.toThrow();
});
