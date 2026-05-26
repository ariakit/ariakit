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
