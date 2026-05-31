import { createStore, subscribe } from "@ariakit/store";
import type * as StoreModule from "@ariakit/store";
import { render } from "@ariakit/test/react";
import { act } from "react";
import { beforeEach, expect, test, vi } from "vitest";
import { useStoreState, useStoreStateObject } from "./index.tsx";

vi.mock("@ariakit/store", async (importOriginal) => {
  const store = await importOriginal<typeof StoreModule>();
  return {
    ...store,
    subscribe: vi.fn(store.subscribe),
  };
});

const subscribeMock = vi.mocked(subscribe);

beforeEach(() => {
  subscribeMock.mockClear();
});

async function runReactAct(callback: () => void) {
  const scope = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
  const previousValue = scope.IS_REACT_ACT_ENVIRONMENT;
  scope.IS_REACT_ACT_ENVIRONMENT = true;
  try {
    await act(async () => callback());
  } finally {
    scope.IS_REACT_ACT_ENVIRONMENT = previousValue;
  }
}

test("useStoreState subscribes to string keys", async () => {
  const store = createStore({ count: 0, label: "a" });

  const Test = () => {
    useStoreState(store, "count");
    return null;
  };

  await render(<Test />);

  expect(subscribeMock).toHaveBeenCalledWith(
    store,
    ["count"],
    expect.any(Function),
  );
});

test("useStoreState rerenders only when the selected key changes", async () => {
  const store = createStore({ count: 0, label: "a" });
  const renderedValues: number[] = [];

  const Test = () => {
    const count = useStoreState(store, "count");
    renderedValues.push(count);
    return null;
  };

  await render(<Test />);

  expect(renderedValues).toEqual([0]);

  await runReactAct(() => {
    store.setState("label", "b");
  });

  expect(renderedValues).toEqual([0]);

  await runReactAct(() => {
    store.setState("count", 1);
  });

  expect(renderedValues).toEqual([0, 1]);
});

test("useStoreState keeps all-keys subscriptions for whole-state reads", async () => {
  const store = createStore({ count: 0, label: "a" });

  const Test = () => {
    useStoreState(store);
    return null;
  };

  await render(<Test />);

  expect(subscribeMock).toHaveBeenCalledWith(store, null, expect.any(Function));
});

test("useStoreState keeps all-keys subscriptions for selectors", async () => {
  const store = createStore({ count: 0, label: "a" });

  const Test = () => {
    useStoreState(store, (state) => state?.count);
    return null;
  };

  await render(<Test />);

  expect(subscribeMock).toHaveBeenCalledWith(store, null, expect.any(Function));
});

test("useStoreStateObject keeps all-keys subscriptions", async () => {
  const store = createStore({ count: 0, label: "a" });

  const Test = () => {
    useStoreStateObject(store, { count: "count" });
    return null;
  };

  await render(<Test />);

  expect(subscribeMock).toHaveBeenCalledWith(store, null, expect.any(Function));
});
