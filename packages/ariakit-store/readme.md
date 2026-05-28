# @ariakit/store

**Important:** This package is experimental and does not follow semantic versioning, meaning breaking changes may occur in patch and minor versions.

Framework-agnostic store primitives used by Ariakit packages.

## Contents

- [Installation](#installation)
- [Usage](#usage)
- [API reference](#api-reference)

## Installation

```sh
npm i @ariakit/store
```

## Usage

Import store helpers from the package root:

```ts
import { createStore } from "@ariakit/store";
```

This package is ESM-only and exposes a single public entrypoint.

<!-- ariakit-docs:start -->

## API reference

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
- [`Store`](#store)

### `createStore`

```ts
function createStore<S extends State>(
  initialState: S,
  ...stores: Array<Store<Partial<S>> | undefined>
): Store<S>;
```

Creates a store.

### `setup`

```ts
type StoreSetup = (callback: () => void | (() => void)) => () => void;

function setup<T extends Store>(
  store?: T | null,
  ...args: Parameters<StoreSetup>
): T extends Store ? ReturnType<StoreSetup> : void;
```

Register a callback function that's called when the store is initialized.

### `init`

```ts
type StoreInit = () => () => void;

function init<T extends Store>(
  store?: T | null,
  ...args: Parameters<StoreInit>
): T extends Store ? ReturnType<StoreInit> : void;
```

Function that should be called when the store is initialized.

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

### `mergeStore`

```ts
function mergeStore<S extends State>(
  ...stores: Array<Store<S> | undefined>
): Store<S>;
```

Merges multiple stores into a single store.

### `throwOnConflictingProps`

```ts
function throwOnConflictingProps(props: AnyObject, store?: Store): void;
```

Throws when a store prop is passed in conjunction with a default state.

### `State`

```ts
type State = AnyObject;
```

Store state type.

### `StoreOptions`

```ts
type StoreOptions<S extends State, K extends keyof S> = Partial<Pick<S, K>>;
```

Initial state that can be passed to a store creator function.

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

### `StoreState`

```ts
type StoreState<T> = T extends Store<infer S> ? S : never;
```

Extracts the state type from a store type.

### `Store`

```ts
interface Store<S = State> {
  /**
   * Returns the current store state.
   */
  getState(): S;
  /**
   * Sets a state value.
   */
  setState<K extends keyof S>(key: K, value: SetStateAction<S[K]>): void;
}
```

Store.

<!-- ariakit-docs:end -->
