import { useStoreState, useStoreStateObject } from "@ariakit/react-store";
import { createStore } from "@ariakit/store";
import type { Store } from "@ariakit/store";
import { useEffect, useReducer, useRef, useState } from "react";

interface TestState {
  foo: number;
  bar: number;
}

interface SelectorCalls {
  state: number;
  object: number;
  unkeyed: number;
  empty: number;
  emptyObject: number;
}

interface StoreProps {
  store: Store<TestState>;
}

interface SelectorProps extends StoreProps {
  calls: SelectorCalls;
}

function KeyedSelectors({ store, calls }: SelectorProps) {
  const value = useStoreState(store, ["foo"], (state) => {
    calls.state += 1;
    return state.foo;
  });
  const object = useStoreStateObject(store, ["foo"], {
    value: (state) => {
      calls.object += 1;
      return state.foo;
    },
    runtimeBar: (state) => Reflect.get(state, "bar"),
  });
  const runtimeBar = useStoreState(store, ["foo"], (state) =>
    Reflect.get(state, "bar"),
  );

  return (
    <>
      <p>
        Selector value: <output aria-label="Selector value">{value}</output>
      </p>
      <p>
        Object selector value:{" "}
        <output aria-label="Object selector value">{object.value}</output>
      </p>
      <p>
        Object runtime bar:{" "}
        <output aria-label="Object runtime bar">{object.runtimeBar}</output>
      </p>
      <p>
        Runtime bar: <output aria-label="Runtime bar">{runtimeBar}</output>
      </p>
    </>
  );
}

function EmptySelector({ store, calls }: SelectorProps) {
  useStoreState(store, [], () => {
    calls.empty += 1;
    return null;
  });
  return null;
}

function UnkeyedSelector({ store, calls }: SelectorProps) {
  useStoreState(store, (state) => {
    calls.unkeyed += 1;
    return state.foo;
  });
  return null;
}

function EmptyObjectSelector({ store, calls }: SelectorProps) {
  useStoreStateObject(store, [], {
    value: () => {
      calls.emptyObject += 1;
      return null;
    },
  });
  return null;
}

function MixedValues({ store }: StoreProps) {
  const values = useStoreStateObject(store, ["foo"], {
    directBar: "bar",
    doubledFoo: (state) => state.foo * 2,
  });

  return (
    <>
      <p>
        Mixed direct bar:{" "}
        <output aria-label="Mixed direct bar">{values.directBar}</output>
      </p>
      <p>
        Mixed doubled foo:{" "}
        <output aria-label="Mixed doubled foo">{values.doubledFoo}</output>
      </p>
    </>
  );
}

function OptionalSelector({ store }: StoreProps) {
  const [currentStore, setCurrentStore] = useState<Store<TestState>>();
  const value = useStoreState(currentStore, ["foo"], (state) => state?.foo);
  const object = useStoreStateObject(currentStore, ["foo"], {
    directBar: "bar",
    derivedFoo: (state) => state?.foo,
  });

  return (
    <>
      <button type="button" onClick={() => setCurrentStore(store)}>
        Use optional store
      </button>
      <button type="button" onClick={() => setCurrentStore(undefined)}>
        Clear optional store
      </button>
      <p>
        Optional value:{" "}
        <output aria-label="Optional value">{value ?? "none"}</output>
      </p>
      <p>
        Optional object direct bar:{" "}
        <output aria-label="Optional object direct bar">
          {object.directBar ?? "none"}
        </output>
      </p>
      <p>
        Optional object derived foo:{" "}
        <output aria-label="Optional object derived foo">
          {object.derivedFoo ?? "none"}
        </output>
      </p>
    </>
  );
}

function DirectValues({ store }: StoreProps) {
  const foo = useStoreState(store, "foo");
  const { bar } = useStoreStateObject(store, { bar: "bar" });

  return (
    <>
      <p>
        Direct foo: <output aria-label="Direct foo">{foo}</output>
      </p>
      <p>
        Direct bar: <output aria-label="Direct bar">{bar}</output>
      </p>
    </>
  );
}

function DynamicSelectors({ store }: StoreProps) {
  const [key, setKey] = useState<keyof TestState>("foo");
  const value = useStoreState(store, [key], (state) => state[key]);
  const object = useStoreStateObject(store, [key], {
    value: (state) => state[key],
  });

  return (
    <>
      <button type="button" onClick={() => setKey("bar")}>
        Subscribe to bar
      </button>
      <p>
        Dynamic selector value:{" "}
        <output aria-label="Dynamic selector value">
          {key}:{value}
        </output>
      </p>
      <p>
        Dynamic object selector value:{" "}
        <output aria-label="Dynamic object selector value">
          {key}:{object.value}
        </output>
      </p>
    </>
  );
}

function Controls({ store, calls }: SelectorProps) {
  const [hydrated, setHydrated] = useState(false);
  const [, forceUpdate] = useReducer((count: number) => count + 1, 0);

  useEffect(() => setHydrated(true), []);

  const getCallCount = (key: keyof SelectorCalls) =>
    hydrated ? calls[key] : 0;

  const update = (key: keyof TestState) => {
    store.setState(key, (value) => value + 1);
    forceUpdate();
  };

  return (
    <>
      <button type="button" onClick={() => update("foo")}>
        Update foo
      </button>
      <button type="button" onClick={() => update("bar")}>
        Update bar
      </button>
      <p>
        useStoreState calls:{" "}
        <output aria-label="useStoreState calls">
          {getCallCount("state")}
        </output>
      </p>
      <p>
        useStoreStateObject calls:{" "}
        <output aria-label="useStoreStateObject calls">
          {getCallCount("object")}
        </output>
      </p>
      <p>
        Unkeyed selector calls:{" "}
        <output aria-label="Unkeyed selector calls">
          {getCallCount("unkeyed")}
        </output>
      </p>
      <p>
        Empty selector calls:{" "}
        <output aria-label="Empty selector calls">
          {getCallCount("empty")}
        </output>
      </p>
      <p>
        Empty object selector calls:{" "}
        <output aria-label="Empty object selector calls">
          {getCallCount("emptyObject")}
        </output>
      </p>
    </>
  );
}

export default function Example() {
  const [store] = useState(() => createStore<TestState>({ foo: 0, bar: 0 }));
  const calls = useRef<SelectorCalls>({
    state: 0,
    object: 0,
    unkeyed: 0,
    empty: 0,
    emptyObject: 0,
  });

  return (
    <>
      <KeyedSelectors store={store} calls={calls.current} />
      <UnkeyedSelector store={store} calls={calls.current} />
      <EmptySelector store={store} calls={calls.current} />
      <EmptyObjectSelector store={store} calls={calls.current} />
      <DirectValues store={store} />
      <MixedValues store={store} />
      <DynamicSelectors store={store} />
      <OptionalSelector store={store} />
      <Controls store={store} calls={calls.current} />
    </>
  );
}
