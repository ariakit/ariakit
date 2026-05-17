import { describe, expect, test, vi } from "vitest";
import {
  batch,
  createStore,
  init,
  internalSync,
  mergeStore,
  omit,
  pick,
  propSync,
  setProp,
  setup,
  subscribe,
  sync,
  throwOnConflictingProps,
} from "./store.ts";

const flushMicrotasks = () => new Promise<void>((r) => queueMicrotask(r));

describe("createStore", () => {
  test("returns a store exposing getState and setState", () => {
    const store = createStore({ count: 0 });
    expect(typeof store.getState).toBe("function");
    expect(typeof store.setState).toBe("function");
    expect(store.getState()).toEqual({ count: 0 });
  });

  test("setState updates state with a value", () => {
    const store = createStore({ count: 0 });
    store.setState("count", 5);
    expect(store.getState().count).toBe(5);
  });

  test("setState updates state with a function updater", () => {
    const store = createStore({ count: 1 });
    store.setState("count", (prev) => prev + 2);
    expect(store.getState().count).toBe(3);
  });

  test("setState on a non-existing key is a no-op", () => {
    const store = createStore({ count: 0 });
    // @ts-expect-error testing unknown key
    store.setState("missing", 1);
    expect(store.getState()).toEqual({ count: 0 });
  });

  test("setState with the same value does not create a new state object", () => {
    const value = { nested: true };
    const store = createStore({ obj: value });
    const before = store.getState();
    store.setState("obj", value);
    expect(store.getState()).toBe(before);
  });

  test("setState produces a new state object when value changes", () => {
    const store = createStore({ count: 0 });
    const before = store.getState();
    store.setState("count", 1);
    expect(store.getState()).not.toBe(before);
    expect(before.count).toBe(0);
  });
});

describe("init", () => {
  test("returns a teardown function", () => {
    const store = createStore({ count: 0 });
    const teardown = init(store);
    expect(typeof teardown).toBe("function");
    teardown?.();
  });

  test("runs setup callbacks on init", () => {
    const store = createStore({ count: 0 });
    const fn = vi.fn();
    setup(store, fn);
    expect(fn).not.toHaveBeenCalled();
    const teardown = init(store);
    expect(fn).toHaveBeenCalledTimes(1);
    teardown?.();
  });

  test("runs setup teardowns when the last instance is destroyed", () => {
    const store = createStore({ count: 0 });
    const teardownFn = vi.fn();
    setup(store, () => teardownFn);
    const a = init(store);
    const b = init(store);
    expect(teardownFn).not.toHaveBeenCalled();
    a?.();
    expect(teardownFn).not.toHaveBeenCalled();
    b?.();
    expect(teardownFn).toHaveBeenCalledTimes(1);
  });

  test("setup callback registered after init is not called on that init", () => {
    const store = createStore({ count: 0 });
    const teardown = init(store);
    const fn = vi.fn();
    setup(store, fn);
    expect(fn).not.toHaveBeenCalled();
    teardown?.();
  });

  test("handles null/undefined stores safely", () => {
    expect(() => init(null)).not.toThrow();
    expect(() => init(undefined)).not.toThrow();
    expect(init(null)).toBeUndefined();
  });
});

describe("setup", () => {
  test("returns an unregister function that prevents the callback from running", () => {
    const store = createStore({ count: 0 });
    const fn = vi.fn();
    const unregister = setup(store, fn);
    unregister?.();
    const teardown = init(store);
    expect(fn).not.toHaveBeenCalled();
    teardown?.();
  });

  test("handles null/undefined stores safely", () => {
    expect(setup(null, () => {})).toBeUndefined();
    expect(setup(undefined, () => {})).toBeUndefined();
  });
});

describe("subscribe", () => {
  test("listener is called after state changes", () => {
    const store = createStore({ count: 0 });
    const fn = vi.fn();
    subscribe(store, null, fn);
    store.setState("count", 1);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenLastCalledWith({ count: 1 }, { count: 0 });
  });

  test("listener is NOT called synchronously on subscribe", () => {
    const store = createStore({ count: 0 });
    const fn = vi.fn();
    subscribe(store, null, fn);
    expect(fn).not.toHaveBeenCalled();
  });

  test("listener is NOT called when value does not change", () => {
    const store = createStore({ count: 0 });
    const fn = vi.fn();
    subscribe(store, null, fn);
    store.setState("count", 0);
    expect(fn).not.toHaveBeenCalled();
  });

  test("listener only fires for matching keys", () => {
    const store = createStore({ a: 0, b: 0 });
    const fn = vi.fn();
    subscribe(store, ["a"], fn);
    store.setState("b", 1);
    expect(fn).not.toHaveBeenCalled();
    store.setState("a", 1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("listener fires for all keys when keys is null", () => {
    const store = createStore({ a: 0, b: 0 });
    const fn = vi.fn();
    subscribe(store, null, fn);
    store.setState("a", 1);
    store.setState("b", 1);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test("unsubscribe stops future notifications", () => {
    const store = createStore({ count: 0 });
    const fn = vi.fn();
    const unsubscribe = subscribe(store, null, fn);
    unsubscribe?.();
    store.setState("count", 1);
    expect(fn).not.toHaveBeenCalled();
  });

  test("listener disposable is called before the next invocation", () => {
    const store = createStore({ count: 0 });
    const dispose = vi.fn();
    subscribe(store, null, () => dispose);
    store.setState("count", 1);
    expect(dispose).not.toHaveBeenCalled();
    store.setState("count", 2);
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  test("listener disposable is called on unsubscribe", () => {
    const store = createStore({ count: 0 });
    const dispose = vi.fn();
    const unsub = subscribe(store, null, () => dispose);
    store.setState("count", 1);
    unsub?.();
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  test("handles null/undefined stores safely", () => {
    expect(subscribe(null, null, () => {})).toBeUndefined();
    expect(subscribe(undefined, null, () => {})).toBeUndefined();
  });
});

describe("sync", () => {
  test("listener is called immediately with current state", () => {
    const store = createStore({ count: 5 });
    const fn = vi.fn();
    sync(store, null, fn);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenLastCalledWith({ count: 5 }, { count: 5 });
  });

  test("listener is called on subsequent state changes", () => {
    const store = createStore({ count: 0 });
    const fn = vi.fn();
    sync(store, null, fn);
    store.setState("count", 1);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test("listener only fires for matching keys", () => {
    const store = createStore({ a: 0, b: 0 });
    const fn = vi.fn();
    sync(store, ["a"], fn);
    fn.mockClear();
    store.setState("b", 1);
    expect(fn).not.toHaveBeenCalled();
    store.setState("a", 1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("unsubscribe stops future notifications", () => {
    const store = createStore({ count: 0 });
    const fn = vi.fn();
    const unsub = sync(store, null, fn);
    fn.mockClear();
    unsub?.();
    store.setState("count", 1);
    expect(fn).not.toHaveBeenCalled();
  });

  test("handles null/undefined stores safely", () => {
    expect(sync(null, null, () => {})).toBeUndefined();
    expect(sync(undefined, null, () => {})).toBeUndefined();
  });
});

describe("batch", () => {
  test("listener is called immediately on subscribe", () => {
    const store = createStore({ count: 0 });
    const fn = vi.fn();
    batch(store, null, fn);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("listener coalesces multiple setState calls in a microtask", async () => {
    const store = createStore({ a: 0, b: 0 });
    const fn = vi.fn();
    batch(store, null, fn);
    fn.mockClear();
    store.setState("a", 1);
    store.setState("b", 2);
    store.setState("a", 3);
    expect(fn).not.toHaveBeenCalled();
    await flushMicrotasks();
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenLastCalledWith({ a: 3, b: 2 }, { a: 0, b: 0 });
  });

  test("listener only fires when a matching key was updated in the batch", async () => {
    const store = createStore({ a: 0, b: 0 });
    const fn = vi.fn();
    batch(store, ["a"], fn);
    fn.mockClear();
    store.setState("b", 1);
    await flushMicrotasks();
    expect(fn).not.toHaveBeenCalled();
    store.setState("a", 1);
    await flushMicrotasks();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("unsubscribe stops future notifications", async () => {
    const store = createStore({ count: 0 });
    const fn = vi.fn();
    const unsub = batch(store, null, fn);
    fn.mockClear();
    unsub?.();
    store.setState("count", 1);
    await flushMicrotasks();
    expect(fn).not.toHaveBeenCalled();
  });

  test("handles null/undefined stores safely", () => {
    expect(batch(null, null, () => {})).toBeUndefined();
    expect(batch(undefined, null, () => {})).toBeUndefined();
  });
});

describe("setProp / propSync", () => {
  test("setProp on a non-existing key is a no-op", () => {
    const store = createStore({ count: 0 });
    // @ts-expect-error unknown key
    setProp(store, "missing", 1);
    expect(store.getState()).toEqual({ count: 0 });
  });

  test("setProp updates the corresponding state", () => {
    const store = createStore({ count: 0 });
    setProp(store, "count", 5);
    expect(store.getState().count).toBe(5);
  });

  test("propSync listener is called immediately with current props", () => {
    const store = createStore({ count: 0 });
    const fn = vi.fn();
    propSync(store, ["count"], fn);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("propSync listener fires only when setProp changes the prop value", () => {
    const store = createStore({ count: 0 });
    const fn = vi.fn();
    propSync(store, ["count"], fn);
    fn.mockClear();
    setProp(store, "count", 1);
    expect(fn).toHaveBeenCalledTimes(1);
    setProp(store, "count", 1);
    expect(fn).toHaveBeenCalledTimes(1);
    setProp(store, "count", 2);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test("controlled prop overrides setState attempts with a different value", () => {
    const store = createStore({ count: 0 });
    setProp(store, "count", 10);
    store.setState("count", 999);
    expect(store.getState().count).toBe(10);
  });

  test("handles null/undefined stores safely", () => {
    expect(setProp(null, "x" as never, 1 as never)).toBeUndefined();
    expect(propSync(undefined, null, () => {})).toBeUndefined();
  });
});

describe("internalSync", () => {
  test("listener is called immediately on subscribe", () => {
    const store = createStore({ count: 0 });
    const fn = vi.fn();
    internalSync(store, null, fn);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("listener fires on internal state changes", () => {
    const store = createStore({ count: 0 });
    const fn = vi.fn();
    internalSync(store, null, fn);
    fn.mockClear();
    store.setState("count", 1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("listener is NOT called when the change is triggered by setProp", () => {
    const store = createStore({ count: 0 });
    const fn = vi.fn();
    internalSync(store, null, fn);
    fn.mockClear();
    setProp(store, "count", 5);
    expect(fn).not.toHaveBeenCalled();
  });

  test("listener sees the internal (pre-controlled) value when prop clamps setState", () => {
    const store = createStore({ count: 0 });
    setProp(store, "count", 10);
    const fn = vi.fn<(state: { count: number }) => void>();
    internalSync(store, ["count"], fn);
    fn.mockClear();
    store.setState("count", 42);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenLastCalledWith(
      expect.objectContaining({ count: 42 }),
      expect.anything(),
    );
    expect(store.getState().count).toBe(10);
  });

  test("handles null/undefined stores safely", () => {
    expect(internalSync(null, null, () => {})).toBeUndefined();
    expect(internalSync(undefined, null, () => {})).toBeUndefined();
  });
});

describe("parent store sync", () => {
  test("state from a parent store is seeded via sync listeners during init", () => {
    const parent = createStore({ count: 5 });
    const child = createStore({ count: 0 }, parent);
    const teardown = init(child);
    parent.setState("count", 7);
    expect(child.getState().count).toBe(7);
    teardown?.();
  });

  test("child setState propagates up to the parent", () => {
    const parent = createStore({ count: 0 });
    const child = createStore({ count: 0 }, parent);
    const teardown = init(child);
    child.setState("count", 3);
    expect(parent.getState().count).toBe(3);
    teardown?.();
  });

  test("setProp on child propagates to parent", () => {
    const parent = createStore({ count: 0 });
    const child = createStore({ count: 0 }, parent);
    const teardown = init(child);
    setProp(child, "count", 9);
    expect(parent.getState().count).toBe(9);
    teardown?.();
  });

  test("keys missing in parent are unaffected by child state", () => {
    const parent = createStore({ a: 0 });
    const child = createStore({ a: 0, b: 0 }, parent);
    const teardown = init(child);
    child.setState("b", 42);
    expect(parent.getState()).toEqual({ a: 0 });
    teardown?.();
  });
});

describe("pick", () => {
  test("creates a sub-store with the specified keys only", () => {
    const store = createStore({ a: 1, b: 2, c: 3 });
    const picked = pick(store, ["a", "b"] as const);
    expect(picked?.getState()).toEqual({ a: 1, b: 2 });
  });

  test("stays in sync with the parent store after init", () => {
    const store = createStore({ a: 1, b: 2 });
    const picked = pick(store, ["a"] as const);
    const teardown = init(picked);
    store.setState("a", 10);
    expect(picked?.getState().a).toBe(10);
    teardown?.();
  });

  test("handles null/undefined stores safely", () => {
    expect(() => pick(null as never, ["a"] as const)).not.toThrow();
  });
});

describe("omit", () => {
  test("creates a sub-store excluding the specified keys", () => {
    const store = createStore({ a: 1, b: 2, c: 3 });
    const omitted = omit(store, ["a"] as const);
    expect(omitted?.getState()).toEqual({ b: 2, c: 3 });
  });

  test("stays in sync with the parent store after init", () => {
    const store = createStore({ a: 1, b: 2 });
    const omitted = omit(store, ["a"] as const);
    const teardown = init(omitted);
    store.setState("b", 99);
    expect(omitted?.getState().b).toBe(99);
    teardown?.();
  });

  test("handles null/undefined stores safely", () => {
    expect(omit(null, ["a"] as const)).toBeUndefined();
    expect(omit(undefined, ["a"] as const)).toBeUndefined();
  });
});

describe("mergeStore", () => {
  test("combines initial state from all stores", () => {
    const a = createStore({ a: 1 });
    const b = createStore({ b: 2 });
    const merged = mergeStore(
      a as unknown as ReturnType<typeof createStore<{ a: number; b: number }>>,
      b as unknown as ReturnType<typeof createStore<{ a: number; b: number }>>,
    );
    expect(merged.getState()).toEqual({ a: 1, b: 2 });
  });

  test("returns a usable store when stores are undefined", () => {
    const merged = mergeStore<{ a: number }>(undefined);
    expect(typeof merged.getState).toBe("function");
    expect(merged.getState()).toEqual({});
  });

  test("propagates updates from merged source stores after init", () => {
    const a = createStore({ x: 0 });
    const merged = mergeStore(
      a as unknown as ReturnType<typeof createStore<{ x: number }>>,
    );
    const teardown = init(merged);
    a.setState("x", 42);
    expect(merged.getState().x).toBe(42);
    teardown?.();
  });
});

describe("throwOnConflictingProps", () => {
  test("throws when a default* prop matches a key on the store", () => {
    const store = createStore({ value: "a" });
    expect(() => throwOnConflictingProps({ defaultValue: "b" }, store)).toThrow(
      /store prop in conjunction with a default state/,
    );
  });

  test("does not throw when default* prop has no matching store key", () => {
    const store = createStore({ value: "a" });
    expect(() =>
      throwOnConflictingProps({ defaultOther: "b" }, store),
    ).not.toThrow();
  });

  test("does not throw when the default value is undefined", () => {
    const store = createStore({ value: "a" });
    expect(() =>
      throwOnConflictingProps({ defaultValue: undefined }, store),
    ).not.toThrow();
  });

  test("does not throw when no default* props are present", () => {
    const store = createStore({ value: "a" });
    expect(() => throwOnConflictingProps({ value: "b" }, store)).not.toThrow();
  });

  test("does not throw when store is undefined", () => {
    expect(() =>
      throwOnConflictingProps({ defaultValue: "b" }, undefined),
    ).not.toThrow();
  });
});
