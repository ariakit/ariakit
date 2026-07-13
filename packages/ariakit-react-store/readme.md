# @ariakit/react-store

**Important:** This package is an internal dependency of Ariakit and does not follow semantic versioning, meaning breaking changes may occur in patch and minor versions. You probably want to use [`@ariakit/react`](https://npmjs.org/package/@ariakit/react) instead.

React bindings for Ariakit store primitives.

## Contents

- [Installation](#installation)
- [Usage](#usage)
- [API reference](#api-reference)

## Installation

```sh
npm i @ariakit/react-store
```

## Usage

Import store hooks from the package root:

```ts
import { useStoreState } from "@ariakit/react-store";
```

This package is ESM-only and exposes a single public entrypoint.

<!-- ariakit-docs:start -->

## API reference

- [`UseState`](#usestate)
- [`useStoreState`](#usestorestate)
- [`useStoreStateObject`](#usestorestateobject)
- [`useStoreProps`](#usestoreprops)
- [`useStore`](#usestore)
- [`Store`](#store)

### `UseState`

```ts
interface UseState<S> {
  /**
   * Re-renders the component when state changes and returns the current state.
   * @deprecated Use
   * [`useStoreState`](https://ariakit.com/reference/use-store-state) instead.
   * @example
   * const state = store.useState();
   */
  (): S;
  /**
   * Re-renders the component when the state changes and returns the current
   * state given the passed key. Changes on other keys will not trigger a
   * re-render.
   * @param key The state key.
   // ... 15 more lines
   * const foo = store.useState((state) => state.foo);
   */
  <V>(selector: (state: S) => V): V;
}
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `useStoreState`

```ts
type StateStore<T = CoreStore<any>> = T | null | undefined;

type StateKey<T = CoreStore<any>> = keyof StoreState<T>;

type SelectorStateKey<T> = T extends CoreStore ? StateKey<T> : never;

type SelectorState<T, K extends PropertyKey> = T extends CoreStore
  ? Pick<StoreState<T>, Extract<K, StateKey<T>>>
  : never;

function useStoreState<T extends CoreStore>(store: T): StoreState<T>;
function useStoreState<T extends CoreStore>(
  store: StateStore<T>,
): StoreState<T> | undefined;
function useStoreState<T extends CoreStore, K extends StateKey<T>>(
  store: T,
  key: K,
): StoreState<T>[K];
function useStoreState<T extends CoreStore, K extends StateKey<T>>(
  store: StateStore<T>,
  key: K,
): StoreState<T>[K] | undefined;
function useStoreState<T extends CoreStore, V>(
  store: T,
  selector: (state: StoreState<T>) => V,
): V;
function useStoreState<T extends CoreStore, V>(
  store: StateStore<T>,
  selector: (state?: StoreState<T>) => V,
): V;
function useStoreState<T extends CoreStore, K extends SelectorStateKey<T>, V>(
  store: T,
  keys: readonly K[],
  selector: (state: SelectorState<T, K>) => V,
): V;
function useStoreState<T extends CoreStore, K extends SelectorStateKey<T>, V>(
  store: StateStore<T>,
  keys: readonly K[],
  selector: (state?: SelectorState<T, K>) => V,
): V;
```

Receives an Ariakit store object (which can be `null` or `undefined`) and returns the current state. If a key is provided as the second argument, it returns the value of that key. If a selector function is provided, the state is passed to it, and its return value is used. Selector calls can pass the state keys they read as the second argument to skip unrelated store updates. This list must include every store key the selector reads, or the returned snapshot may stay stale. An empty list means store updates will never notify the selector.

The component using this hook will re-render when the returned value changes.

Example:

Accessing the whole combobox state:

```js
const combobox = Ariakit.useComboboxStore();
const state = Ariakit.useStoreState(combobox);
```

Example:

Accessing a specific value from the combobox state:

```js
const combobox = Ariakit.useComboboxStore();
const value = Ariakit.useStoreState(combobox, "value");
```

Example:

Accessing a value using a selector function:

```js
const combobox = Ariakit.useComboboxStore();
const value = Ariakit.useStoreState(combobox, (state) => state.value);
```

Example:

Subscribing only to the state keys read by a selector:

```js
const tab = Ariakit.useTabStore();
const selected = Ariakit.useStoreState(
  tab,
  ["selectedId"],
  (state) => state.selectedId === "details",
);
```

Example:

Accessing the state of a store that may be `null` or `undefined` (for
example, using a context):

```js
const combobox = Ariakit.useComboboxContext();
const value = Ariakit.useStoreState(combobox, "value");
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `useStoreStateObject`

```ts
type StateStore<T = CoreStore<any>> = T | null | undefined;

type StateKey<T = CoreStore<any>> = keyof StoreState<T>;

type SelectorStateKey<T> = T extends CoreStore ? StateKey<T> : never;

type SelectorState<T, K extends PropertyKey> = T extends CoreStore
  ? Pick<StoreState<T>, Extract<K, StateKey<T>>>
  : never;

type StoreStateObject<T extends StateStore, S> = Record<
  string,
  StateKey<T> | ((state: S) => any)
>;

type StoreStateObjectResult<
  T extends StateStore,
  S extends StoreState<T> | undefined,
  O extends Record<string, StateKey<T> | AnyFunction>,
> = {
  [K in keyof O]: O[K] extends keyof StoreState<T>
    ? O[K] extends keyof S
      ? S[O[K]]
      : StoreState<T>[O[K]] | undefined
    : O[K] extends AnyFunction
      ? ReturnType<O[K]>
      : never;
};

function useStoreStateObject<
  T extends CoreStore,
  O extends StoreStateObject<T, StoreState<T>>,
>(store: T, object: O): StoreStateObjectResult<T, StoreState<T>, O>;
function useStoreStateObject<
  T extends StateStore,
  O extends StoreStateObject<T, StoreState<T> | undefined>,
>(store: T, object: O): StoreStateObjectResult<T, StoreState<T> | undefined, O>;
function useStoreStateObject<
  T extends CoreStore,
  K extends SelectorStateKey<T>,
  O extends StoreStateObject<T, SelectorState<T, K>>,
>(
  store: T,
  keys: readonly K[],
  object: O,
): StoreStateObjectResult<T, StoreState<T>, O>;
function useStoreStateObject<
  T extends CoreStore,
  K extends SelectorStateKey<T>,
  O extends StoreStateObject<T, SelectorState<T, K> | undefined>,
>(
  store: StateStore<T>,
  keys: readonly K[],
  object: O,
): StoreStateObjectResult<T, StoreState<T> | undefined, O>;
```

Receives an Ariakit store object (which can be `null` or `undefined`) and returns the current state. Unlike `useStoreState`, this hook receives an object with keys that map to store keys or selector functions. Store keys in the object are always subscribed to. When selector dependency keys are passed as the second argument, they must include every store key read by every selector, or the returned snapshot may stay stale. An empty list means only direct store keys in the object will notify the selectors.

Example:

Reading direct and derived values with selector dependencies:

```js
const values = useStoreStateObject(store, ["value"], {
  value: "value",
  valueLength: (state) => state.value.length,
});
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `useStoreProps`

```ts
function useStoreProps<
  S extends State,
  P extends Partial<S>,
  K extends keyof S,
  SK extends keyof PickByValue<P, SetState<P[K]>>,
>(store: CoreStore<S>, props: P, key: K, setKey?: SK): void;
```

Synchronizes the store with the props, including parent store props.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `useStore`

```ts
function useStore<T extends CoreStore, P>(
  createStore: (props: P) => T,
  props: P,
): readonly [T & { useState: UseState<StoreState<T>> }, () => void];
```

Creates a React store from a core store object and returns a tuple with the store and a function to update the store.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `Store`

```ts
type Store<T extends CoreStore = CoreStore> = T & {
  /**
   * Re-renders the component when the state changes and returns the current
   * state.
   * @deprecated Use
   * [`useStoreState`](https://ariakit.com/reference/use-store-state) instead.
   */
  useState: UseState<StoreState<T>>;
};
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

<!-- ariakit-docs:end -->
