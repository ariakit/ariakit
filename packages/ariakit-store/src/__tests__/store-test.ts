import { createStore, subscribe, sync } from "@ariakit/store";
import { expect, test } from "vitest";

test("createStore updates state from the package entrypoint", () => {
  const store = createStore({ count: 0 });
  const calls: number[] = [];

  const unsubscribe = subscribe(store, ["count"], (state) => {
    calls.push(state.count);
  });

  store.setState("count", 1);
  unsubscribe?.();
  store.setState("count", 2);

  expect(store.getState()).toEqual({ count: 2 });
  expect(calls).toEqual([1]);
});

test("sync runs immediately and on matching updates", () => {
  const store = createStore({ count: 0, name: "Ariakit" });
  const calls: Array<[number, number]> = [];

  const unsubscribe = sync(store, ["count"], (state, previousState) => {
    calls.push([state.count, previousState.count]);
  });

  store.setState("name", "Store");
  store.setState("count", 1);
  unsubscribe?.();

  expect(calls).toEqual([
    [0, 0],
    [1, 0],
  ]);
});
