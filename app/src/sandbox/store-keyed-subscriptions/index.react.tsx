import {
  useStoreProps,
  useStoreState,
  useStoreStateObject,
} from "@ariakit/react-store";
import { createStore } from "@ariakit/store";
import type { Store } from "@ariakit/store";
import type { SetState } from "@ariakit/utils";
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
  conditional: number;
}

interface StoreProps {
  store: Store<TestState>;
}

interface StorePropsSetterProps extends Partial<TestState> {
  setFoo?: SetState<number>;
}

interface NaNStoreProps {
  value?: number;
  setValue?: SetState<number>;
}

type StoreListener<S> = (state: S, prevState: S) => void | (() => void);
type StoreSubscription<S> = (
  keys: Array<keyof S> | null,
  listener: StoreListener<S>,
) => () => void;

interface StoreInternals<S> {
  subscribe: StoreSubscription<S>;
  sync: StoreSubscription<S>;
}

function hasStoreInternals<S>(
  store: Store<S>,
): store is Store<S> & { __unstableInternals: StoreInternals<S> } {
  if (!Object.hasOwn(store, "__unstableInternals")) return false;
  const internals = Reflect.get(store, "__unstableInternals");
  if (!internals || typeof internals !== "object") return false;
  if (typeof Reflect.get(internals, "subscribe") !== "function") return false;
  return typeof Reflect.get(internals, "sync") === "function";
}

function observeStoreSubscriptions<S>(store: Store<S>) {
  if (!hasStoreInternals(store)) {
    throw new TypeError("Expected an Ariakit store");
  }
  const internals = store.__unstableInternals;
  let activeSubscriptions = 0;

  const observe =
    (subscribe: StoreSubscription<S>): StoreSubscription<S> =>
    (keys, listener) => {
      const unsubscribe = subscribe(keys, listener);
      activeSubscriptions += 1;
      let active = true;
      return () => {
        if (!active) return;
        active = false;
        activeSubscriptions -= 1;
        unsubscribe();
      };
    };

  return [
    {
      ...store,
      __unstableInternals: {
        ...internals,
        // Observe both paths so this fails if useStoreProps restores its old
        // unconditional synchronous listener.
        subscribe: observe(internals.subscribe),
        sync: observe(internals.sync),
      },
    },
    () => activeSubscriptions,
  ] as const;
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

function ConditionalSelector({ store, calls }: SelectorProps) {
  const [enabled, setEnabled] = useState(false);
  const value = useStoreState(store, enabled ? ["foo"] : [], (state) => {
    calls.conditional += 1;
    return enabled ? state.foo : null;
  });

  return (
    <>
      <button type="button" onClick={() => setEnabled((value) => !value)}>
        {enabled ? "Pause conditional selector" : "Enable conditional selector"}
      </button>
      <p>
        Conditional selector value:{" "}
        <output aria-label="Conditional selector value">
          {value ?? "paused"}
        </output>
      </p>
    </>
  );
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

function StorePropsSetter({ store }: StoreProps) {
  const [activeSetter, setActiveSetter] = useState<"first" | "second">();
  const [[observedStore, getActiveSubscriptions]] = useState(() =>
    observeStoreSubscriptions(store),
  );
  const [activeSubscriptions, setActiveSubscriptions] = useState(0);
  const [firstValue, setFirstValue] = useState(-1);
  const [secondValue, setSecondValue] = useState(-1);
  const [nanStore] = useState(() => createStore({ value: Number.NaN }));
  const [nanSetterEnabled, setNanSetterEnabled] = useState(false);
  const [nanControlled, setNanControlled] = useState(false);
  const [nanSetterCalls, setNanSetterCalls] = useState(0);
  const setFoo =
    activeSetter === "first"
      ? setFirstValue
      : activeSetter === "second"
        ? setSecondValue
        : undefined;
  const setNanValue: SetState<number> | undefined = nanSetterEnabled
    ? () => setNanSetterCalls((calls) => calls + 1)
    : undefined;
  const storeProps: StorePropsSetterProps = { setFoo };
  const nanStoreProps: NaNStoreProps = {
    setValue: setNanValue,
    value: nanControlled ? Number.NaN : undefined,
  };

  useStoreProps(observedStore, storeProps, "foo", "setFoo");
  useStoreProps(nanStore, nanStoreProps, "value", "setValue");

  useEffect(() => {
    setActiveSubscriptions(getActiveSubscriptions());
  }, [activeSetter, getActiveSubscriptions]);

  return (
    <>
      <button type="button" onClick={() => setActiveSetter("first")}>
        Use first setter
      </button>
      <button type="button" onClick={() => setActiveSetter("second")}>
        Use second setter
      </button>
      <button type="button" onClick={() => setActiveSetter(undefined)}>
        Clear setter
      </button>
      <button type="button" onClick={() => setNanSetterEnabled(true)}>
        Enable NaN setter
      </button>
      <button type="button" onClick={() => nanStore.setState("value", 1)}>
        Update NaN value
      </button>
      <button type="button" onClick={() => setNanControlled(true)}>
        Control NaN value
      </button>
      <p>
        Active setter subscriptions:{" "}
        <output aria-label="Active setter subscriptions">
          {activeSubscriptions}
        </output>
      </p>
      <p>
        First setter value:{" "}
        <output aria-label="First setter value">
          {firstValue < 0 ? "none" : firstValue}
        </output>
      </p>
      <p>
        Second setter value:{" "}
        <output aria-label="Second setter value">
          {secondValue < 0 ? "none" : secondValue}
        </output>
      </p>
      <p>
        NaN setter calls:{" "}
        <output aria-label="NaN setter calls">{nanSetterCalls}</output>
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
      <p>
        Conditional selector calls:{" "}
        <output aria-label="Conditional selector calls">
          {getCallCount("conditional")}
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
    conditional: 0,
  });

  return (
    <>
      <KeyedSelectors store={store} calls={calls.current} />
      <UnkeyedSelector store={store} calls={calls.current} />
      <EmptySelector store={store} calls={calls.current} />
      <EmptyObjectSelector store={store} calls={calls.current} />
      <ConditionalSelector store={store} calls={calls.current} />
      <DirectValues store={store} />
      <MixedValues store={store} />
      <DynamicSelectors store={store} />
      <OptionalSelector store={store} />
      <StorePropsSetter store={store} />
      <Controls store={store} calls={calls.current} />
    </>
  );
}
