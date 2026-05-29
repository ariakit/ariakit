# @ariakit/solid-store

**Important:** This package is an internal dependency of Ariakit and does not follow semantic versioning, meaning breaking changes may occur in patch and minor versions.

Solid-facing entrypoint for Ariakit store primitives. This package currently re-exports the framework-agnostic store helpers from `@ariakit/store`.

## Contents

- [Installation](#installation)
- [Usage](#usage)
- [API reference](#api-reference)

## Installation

```sh
npm i @ariakit/solid-store
```

## Usage

Import store helpers from the package root:

```ts
import { createStore } from "@ariakit/solid-store";
```

This package is ESM-only and exposes a single public entrypoint.

<!-- ariakit-docs:start -->

## API reference

- [`MaybeAccessor`](#maybeaccessor)
- [`UseState`](#usestate)
- [`useStoreState`](#usestorestate)
- [`useStoreStateObject`](#usestorestateobject)
- [`useStoreProps`](#usestoreprops)
- [`useStore`](#usestore)
- [`useDynamicStoreState`](#usedynamicstorestate)
- [`Store`](#store)
- [`createStore`](#createstore)
- [`setup`](#setup)
- [`init`](#init)
- [`subscribe`](#subscribe)
- [`sync`](#sync)
- [`batch`](#batch)
- [`omit`](#omit)
- [`pick`](#pick)
- [`mergeStore`](#mergestore)
- [`throwOnConflictingProps`](#throwonconflictingprops)
- [`State`](#state)
- [`StoreOptions`](#storeoptions)
- [`StoreProps`](#storeprops)
- [`StoreState`](#storestate)

### `MaybeAccessor`

```ts
type MaybeAccessor<T> = T | Accessor<T>;
```

A value that may be a plain value or a reactive accessor that returns it. Mirrors `@solid-primitives/utils`'s `MaybeAccessor`, kept local so the store bindings stay self-contained.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `UseState`

```ts
interface UseState<S> {
  /**
   * Re-renders the component when state changes and returns the current state.
   * @deprecated Use
   * [`useStoreState`](https://solid.ariakit.com/reference/use-store-state) instead.
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
type StateStore<T = CoreStore> = T | null | undefined;

type StateKey<T = CoreStore> = keyof StoreState<T>;

function useStoreState<T extends CoreStore>(
  store: MaybeAccessor<T>,
): Accessor<StoreState<T>>;
function useStoreState<T extends CoreStore>(
  store: MaybeAccessor<StateStore<T>>,
): Accessor<StoreState<T> | undefined>;
function useStoreState<T extends CoreStore, K extends StateKey<T>>(
  store: MaybeAccessor<T>,
  key: K,
): Accessor<StoreState<T>[K]>;
function useStoreState<T extends CoreStore, K extends StateKey<T>>(
  store: MaybeAccessor<StateStore<T>>,
  key: K,
): Accessor<StoreState<T>[K] | undefined>;
function useStoreState<T extends CoreStore, V>(
  store: MaybeAccessor<T>,
  selector: (state: StoreState<T>) => V,
): Accessor<V>;
function useStoreState<T extends CoreStore, V>(
  store: MaybeAccessor<StateStore<T>>,
  selector: (state?: StoreState<T>) => V,
): Accessor<V>;
```

Receives an Ariakit store object (which can be `null` or `undefined`) and returns an accessor to the current state. If a key is provided as the second argument, the accessor returns the value of that key. If a selector function is provided, the state is passed to it, and its return value is used.

Unlike React, this returns an accessor rather than the value itself, so downstream Solid reactive scopes that read it track the underlying signal.

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
type StateStore<T = CoreStore> = T | null | undefined;

type StateKey<T = CoreStore> = keyof StoreState<T>;

type StoreStateObject<
  T extends StateStore,
  S extends StoreState<T> | undefined,
> = Record<string, StateKey<T> | ((state: S) => any)>;

type StoreStateObjectResult<
  T extends StateStore,
  S extends StoreState<T> | undefined,
  O extends StoreStateObject<T, S>,
> = {
  [K in keyof O]: O[K] extends keyof StoreState<T>
    ? O[K] extends keyof S
      ? S[O[K]]
      : StoreState<T>[O[K]] | undefined
    : O[K] extends (state: S) => infer R
      ? R
      : never;
};

function useStoreStateObject<
  T extends CoreStore,
  O extends StoreStateObject<T, StoreState<T>>,
>(
  store: MaybeAccessor<T>,
  object: O,
): Accessor<StoreStateObjectResult<T, StoreState<T>, O>>;
function useStoreStateObject<
  T extends StateStore,
  O extends StoreStateObject<T, StoreState<T> | undefined>,
>(
  store: MaybeAccessor<T>,
  object: O,
): Accessor<StoreStateObjectResult<T, StoreState<T> | undefined, O>>;
```

Receives an Ariakit store object (which can be `null` or `undefined`) and returns an accessor to the current state. Unlike `useStoreState`, this hook receives an object with keys that map to store keys or selector functions.

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
>(
  store: MaybeAccessor<CoreStore<S>>,
  props: P,
  key: MaybeAccessor<K>,
  setKey?: SK,
): void;
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
): readonly [Accessor<T & { useState: UseState<StoreState<T>> }>, () => void];
```

Creates a Solid store from a core store object and returns a tuple with an accessor to the store and a function to update the store.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `useDynamicStoreState`

```ts
function useDynamicStoreState<T extends CoreStore, V>(
  store: Accessor<T | undefined>,
  selector: (state?: StoreState<T>) => V,
): Accessor<V>;
```

Reads derived state from a store whose identity may change, re-subscribing when the store swaps. This is the #4616 helper, generalized: wrapping `useStoreState` in a memo keyed on the store accessor makes the whole derivation re-instantiate its subscription when the store identity changes.

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
   * [`useStoreState`](https://solid.ariakit.com/reference/use-store-state) instead.
   */
  useState: UseState<StoreState<T>>;
};
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `createStore`

```ts
function createStore<S extends State>(
  initialState: S,
  ...stores: Array<Store<Partial<S>> | undefined>
): Store<S>;
```

Creates a store.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `setup`

```ts
type StoreSetup = (callback: () => void | (() => void)) => () => void;

function setup<T extends Store>(
  store?: T | null,
  ...args: Parameters<StoreSetup>
): T extends Store ? ReturnType<StoreSetup> : void;
```

Register a callback function that's called when the store is initialized.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `init`

```ts
type StoreInit = () => () => void;

function init<T extends Store>(
  store?: T | null,
  ...args: Parameters<StoreInit>
): T extends Store ? ReturnType<StoreInit> : void;
```

Function that should be called when the store is initialized.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `subscribe`

```ts
type Listener<S> = (state: S, prevState: S) => void | (() => void);

type Sync<S, K extends keyof S> = (
  keys: K[] | null,
  listener: Listener<Pick<S, K>>,
) => () => void;

type StoreSubscribe<S = State, K extends keyof S = keyof S> = Sync<S, K>;

function subscribe<T extends Store, K extends keyof StoreState<T>>(
  store?: T | null,
  ...args: Parameters<StoreSubscribe<StoreState<T>, K>>
): T extends Store ? ReturnType<StoreSubscribe<StoreState<T>, K>> : void;
```

Registers a listener function that's called after state changes in the store.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `sync`

```ts
type Listener<S> = (state: S, prevState: S) => void | (() => void);

type Sync<S, K extends keyof S> = (
  keys: K[] | null,
  listener: Listener<Pick<S, K>>,
) => () => void;

type StoreSync<S = State, K extends keyof S = keyof S> = Sync<S, K>;

function sync<T extends Store, K extends keyof StoreState<T>>(
  store?: T | null,
  ...args: Parameters<StoreSync<StoreState<T>, K>>
): T extends Store ? ReturnType<StoreSync<StoreState<T>, K>> : void;
```

Registers a listener function that's called immediately and synchronously whenever the store state changes.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `batch`

```ts
type Listener<S> = (state: S, prevState: S) => void | (() => void);

type Sync<S, K extends keyof S> = (
  keys: K[] | null,
  listener: Listener<Pick<S, K>>,
) => () => void;

type StoreBatch<S = State, K extends keyof S = keyof S> = Sync<S, K>;

function batch<T extends Store, K extends keyof StoreState<T>>(
  store?: T | null,
  ...args: Parameters<StoreBatch<StoreState<T>, K>>
): T extends Store ? ReturnType<StoreBatch<StoreState<T>, K>> : void;
```

Registers a listener function that's called immediately and after a batch of state changes in the store.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `omit`

```ts
type StoreOmit<
  S = State,
  K extends ReadonlyArray<keyof S> = ReadonlyArray<keyof S>,
> = (keys: K) => Store<Omit<S, K[number]>>;

function omit<T extends Store, K extends ReadonlyArray<keyof StoreState<T>>>(
  store?: T | null,
  ...args: Parameters<StoreOmit<StoreState<T>, K>>
): T extends Store ? ReturnType<StoreOmit<StoreState<T>, K>> : void;
```

Creates a new store with a subset of the current store state and keeps them in sync.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `pick`

```ts
type StorePick<
  S = State,
  K extends ReadonlyArray<keyof S> = ReadonlyArray<keyof S>,
> = (keys: K) => Store<Pick<S, K[number]>>;

function pick<T extends Store, K extends ReadonlyArray<keyof StoreState<T>>>(
  store?: T | null,
  ...args: Parameters<StorePick<StoreState<T>, K>>
): T extends Store ? ReturnType<StorePick<StoreState<T>, K>> : void;
```

Creates a new store with a subset of the current store state and keeps them in sync.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `mergeStore`

```ts
function mergeStore<S extends State>(
  ...stores: Array<Store<S> | undefined>
): Store<S>;
```

Merges multiple stores into a single store.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `throwOnConflictingProps`

```ts
function throwOnConflictingProps(props: AnyObject, store?: Store): void;
```

Throws when a store prop is passed in conjunction with a default state.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `State`

```ts
type State = AnyObject;
```

Store state type.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `StoreOptions`

```ts
type StoreOptions<S extends State, K extends keyof S> = Partial<Pick<S, K>>;
```

Initial state that can be passed to a store creator function.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `StoreProps`

```ts
interface StoreProps<S extends State = State> {
  /**
   * Another store object that will be kept in sync with the original store.
   *
   * Live examples:
   * - [Navigation Menubar](https://ariakit.com/examples/menubar-navigation)
   */
  store?: Store<Partial<S>>;
}
```

Props that can be passed to a store creator function.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### `StoreState`

```ts
type StoreState<T> = T extends Store<infer S> ? S : never;
```

Extracts the state type from a store type.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

<!-- ariakit-docs:end -->
