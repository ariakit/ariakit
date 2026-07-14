import { useStoreState, useStoreStateObject } from "@ariakit/react-store";
import { createStore } from "@ariakit/store";
import { click, q } from "@ariakit/test";
import { expect, expectTypeOf, test } from "vitest";

test("supports keyed selector types", () => {
  const store = createStore({
    a: "a",
    bar: "bar",
    foo: "foo",
    key: "key",
    otherKey: "otherKey",
  });
  const countStore = createStore({ kind: "count" as const, count: 0 });
  const labelStore = createStore({ kind: "label" as const, label: "" });

  const useCheckTypes = (optionalStore?: typeof store) => {
    expectTypeOf(useStoreState(store, "key")).toEqualTypeOf<string>();
    expectTypeOf(
      useStoreState(store, (state) => state.key),
    ).toEqualTypeOf<string>();
    expectTypeOf(
      useStoreState(store, ["key"], (state) => state.key),
    ).toEqualTypeOf<string>();

    const object = useStoreStateObject(store, {
      foo: "otherKey",
      bar: (state) => state.key,
    });
    expectTypeOf(object).toEqualTypeOf<{ foo: string; bar: string }>();

    const keyedObject = useStoreStateObject(store, ["key"], {
      foo: "otherKey",
      bar: (state) => state.key,
    });
    expectTypeOf(keyedObject).toEqualTypeOf<{ foo: string; bar: string }>();

    const multiKeyedObject = useStoreStateObject(store, ["foo", "bar"], {
      a: "a",
      foo: (state) => state.foo,
      bar: (state) => state.bar,
    });
    expectTypeOf(multiKeyedObject).toEqualTypeOf<{
      a: string;
      foo: string;
      bar: string;
    }>();

    const optionalKey = useStoreState(
      optionalStore,
      ["key"],
      (state) => state?.key,
    );
    expectTypeOf(optionalKey).toEqualTypeOf<string | undefined>();

    const optionalObject = useStoreStateObject(optionalStore, ["key"], {
      direct: "otherKey",
      derived: (state) => state?.key,
    });
    expectTypeOf(optionalObject).toEqualTypeOf<{
      direct: string | undefined;
      derived: string | undefined;
    }>();

    const unionStore: typeof countStore | typeof labelStore =
      Math.random() > 0.5 ? countStore : labelStore;
    const unionValue = useStoreState(
      unionStore,
      ["kind", "count", "label"],
      (state) => (state.kind === "count" ? state.count : state.label),
    );
    expectTypeOf(unionValue).toEqualTypeOf<number | string>();

    // @ts-expect-error Selector reads an undeclared key.
    useStoreState(store, ["foo"], (state) => state.bar);
    // @ts-expect-error Key arrays require a third selector argument.
    useStoreState(store, ["foo"]);
    // @ts-expect-error The third argument must be a function.
    useStoreState(store, ["foo"], "foo");
    // @ts-expect-error The store and third argument have invalid types.
    useStoreState("store", ["foo"], "foo");
    // @ts-expect-error Object selector reads an undeclared key.
    useStoreStateObject(store, ["foo"], { bar: (state) => state.bar });
    useStoreStateObject(optionalStore, ["foo"], {
      // @ts-expect-error Optional object selector reads an undeclared key.
      bar: (state) => state?.bar,
    });
    // @ts-expect-error Key arrays require a third object argument.
    useStoreStateObject(store, ["foo"]);
    // @ts-expect-error The third argument must be an object.
    useStoreStateObject(store, ["foo"], (state) => state.foo);
  };

  expectTypeOf(useCheckTypes).toEqualTypeOf<
    (optionalStore?: typeof store) => void
  >();
});

test("runs selectors only for subscribed keys", async () => {
  const stateCalls = q.status.ensure("useStoreState calls").textContent;
  const objectCalls = q.status.ensure("useStoreStateObject calls").textContent;
  const unkeyedCalls = q.status.ensure("Unkeyed selector calls").textContent;
  const emptyCalls = q.status.ensure("Empty selector calls").textContent;
  const emptyObjectCalls = q.status.ensure(
    "Empty object selector calls",
  ).textContent;

  expect(q.status("Optional value")).toHaveTextContent("none");
  expect(q.status("Optional object direct bar")).toHaveTextContent("none");
  expect(q.status("Optional object derived foo")).toHaveTextContent("none");

  await click(q.button("Update bar"));

  expect(q.status.ensure("useStoreState calls").textContent).toBe(stateCalls);
  expect(q.status.ensure("useStoreStateObject calls").textContent).toBe(
    objectCalls,
  );
  expect(q.status.ensure("Empty selector calls").textContent).toBe(emptyCalls);
  expect(q.status.ensure("Empty object selector calls").textContent).toBe(
    emptyObjectCalls,
  );
  expect(q.status.ensure("Unkeyed selector calls").textContent).not.toBe(
    unkeyedCalls,
  );
  expect(q.status("Direct bar")).toHaveTextContent("1");
  expect(q.status("Mixed direct bar")).toHaveTextContent("1");
  expect(q.status("Mixed doubled foo")).toHaveTextContent("0");
  expect(q.status("Runtime bar")).toHaveTextContent("0");
  expect(q.status("Object runtime bar")).toHaveTextContent("0");

  await click(q.button("Update foo"));

  expect(q.status.ensure("useStoreState calls").textContent).not.toBe(
    stateCalls,
  );
  expect(q.status.ensure("useStoreStateObject calls").textContent).not.toBe(
    objectCalls,
  );
  expect(q.status.ensure("Empty selector calls").textContent).toBe(emptyCalls);
  expect(q.status.ensure("Empty object selector calls").textContent).toBe(
    emptyObjectCalls,
  );
  expect(q.status("Selector value")).toHaveTextContent("1");
  expect(q.status("Object selector value")).toHaveTextContent("1");
  expect(q.status("Direct foo")).toHaveTextContent("1");
  expect(q.status("Mixed doubled foo")).toHaveTextContent("2");
  expect(q.status("Runtime bar")).toHaveTextContent("1");
  expect(q.status("Object runtime bar")).toHaveTextContent("1");

  await click(q.button("Use optional store"));
  expect(q.status("Optional value")).toHaveTextContent("1");
  expect(q.status("Optional object direct bar")).toHaveTextContent("1");
  expect(q.status("Optional object derived foo")).toHaveTextContent("1");

  await click(q.button("Update bar"));
  expect(q.status("Optional value")).toHaveTextContent("1");
  expect(q.status("Optional object direct bar")).toHaveTextContent("2");
  expect(q.status("Optional object derived foo")).toHaveTextContent("1");

  await click(q.button("Update foo"));
  expect(q.status("Optional value")).toHaveTextContent("2");
  expect(q.status("Optional object direct bar")).toHaveTextContent("2");
  expect(q.status("Optional object derived foo")).toHaveTextContent("2");

  await click(q.button("Clear optional store"));
  expect(q.status("Optional value")).toHaveTextContent("none");
  expect(q.status("Optional object direct bar")).toHaveTextContent("none");
  expect(q.status("Optional object derived foo")).toHaveTextContent("none");
});

test("updates dynamic selector dependencies", async () => {
  const selectorValue = q.status("Dynamic selector value");
  const objectValue = q.status("Dynamic object selector value");

  expect(selectorValue).toHaveTextContent("foo:0");
  expect(objectValue).toHaveTextContent("foo:0");

  await click(q.button("Update bar"));

  expect(selectorValue).toHaveTextContent("foo:0");
  expect(objectValue).toHaveTextContent("foo:0");

  await click(q.button("Subscribe to bar"));

  expect(selectorValue).toHaveTextContent("bar:1");
  expect(objectValue).toHaveTextContent("bar:1");

  await click(q.button("Update foo"));

  expect(selectorValue).toHaveTextContent("bar:1");
  expect(objectValue).toHaveTextContent("bar:1");

  await click(q.button("Update bar"));

  expect(selectorValue).toHaveTextContent("bar:2");
  expect(objectValue).toHaveTextContent("bar:2");
});

test("attaches and detaches conditional selector dependencies", async () => {
  const selectorValue = q.status("Conditional selector value");
  const calls = q.status.ensure("Conditional selector calls");
  const pausedCalls = calls.textContent;

  expect(selectorValue).toHaveTextContent("paused");

  await click(q.button("Update foo"));

  expect(selectorValue).toHaveTextContent("paused");
  expect(calls.textContent).toBe(pausedCalls);

  await click(q.button("Enable conditional selector"));

  expect(selectorValue).toHaveTextContent("1");

  await click(q.button("Update foo"));

  expect(selectorValue).toHaveTextContent("2");
  expect(calls.textContent).not.toBe(pausedCalls);

  await click(q.button("Pause conditional selector"));

  expect(selectorValue).toHaveTextContent("paused");

  await click(q.button("Update bar"));

  expect(selectorValue).toHaveTextContent("paused");
  const detachedCalls = calls.textContent;

  await click(q.button("Update foo"));

  expect(selectorValue).toHaveTextContent("paused");
  expect(calls.textContent).toBe(detachedCalls);
});

test("updates the store props setter subscription", async () => {
  const firstValue = q.status("First setter value");
  const secondValue = q.status("Second setter value");
  const nanSetterCalls = q.status("NaN setter calls");
  const activeSubscriptions = q.status("Active setter subscriptions");

  expect(firstValue).toHaveTextContent("none");
  expect(secondValue).toHaveTextContent("none");
  expect(nanSetterCalls).toHaveTextContent("0");
  expect(activeSubscriptions).toHaveTextContent("0");

  await click(q.button("Enable NaN setter"));
  expect(nanSetterCalls).toHaveTextContent("0");

  await click(q.button("Update NaN value"));
  expect(nanSetterCalls).toHaveTextContent("1");

  await click(q.button("Control NaN value"));
  expect(nanSetterCalls).toHaveTextContent("1");

  await click(q.button("Update foo"));
  expect(firstValue).toHaveTextContent("none");
  expect(secondValue).toHaveTextContent("none");

  await click(q.button("Use first setter"));
  expect(activeSubscriptions).toHaveTextContent("1");
  expect(firstValue).toHaveTextContent("none");
  await click(q.button("Update foo"));
  expect(firstValue).toHaveTextContent("2");
  expect(secondValue).toHaveTextContent("none");

  await click(q.button("Use second setter"));
  expect(activeSubscriptions).toHaveTextContent("1");
  expect(secondValue).toHaveTextContent("none");
  await click(q.button("Update foo"));
  expect(firstValue).toHaveTextContent("2");
  expect(secondValue).toHaveTextContent("3");

  await click(q.button("Clear setter"));
  expect(activeSubscriptions).toHaveTextContent("0");
  await click(q.button("Update foo"));
  expect(firstValue).toHaveTextContent("2");
  expect(secondValue).toHaveTextContent("3");

  await click(q.button("Use first setter"));
  expect(activeSubscriptions).toHaveTextContent("1");
  expect(firstValue).toHaveTextContent("2");
  await click(q.button("Update foo"));
  expect(firstValue).toHaveTextContent("5");
  expect(secondValue).toHaveTextContent("3");
});
