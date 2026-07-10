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

- [Other exports](#other-exports)
  - [`UseState`](#usestate)
  - [`useStoreState`](#usestorestate)
  - [`useStoreStateObject`](#usestorestateobject)
  - [`useStoreProps`](#usestoreprops)
  - [`useStore`](#usestore)
  - [`Store`](#store)
- [System utilities](#system-utilities)
  - [`ProviderComponent`](#providercomponent)

### Other exports

#### `UseState`

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

#### `useStoreState`

```ts
type StateStore<T = CoreStore> = T | null | undefined;

type StateKey<T = CoreStore> = keyof StoreState<T>;

function useStoreState<T extends CoreStore>(store: T): StoreState<T>;
function useStoreState<T extends CoreStore>(
  store: StateStore<T> | ProviderComponent<T>,
): StoreState<T> | undefined;
function useStoreState<T extends CoreStore, K extends StateKey<T>>(
  store: T,
  key: K,
): StoreState<T>[K];
function useStoreState<T extends CoreStore, K extends StateKey<T>>(
  store: StateStore<T> | ProviderComponent<T>,
  key: K,
): StoreState<T>[K] | undefined;
function useStoreState<T extends CoreStore, V>(
  store: T,
  selector: (state: StoreState<T>) => V,
): V;
function useStoreState<T extends CoreStore, V>(
  store: StateStore<T> | ProviderComponent<T>,
  selector: (state?: StoreState<T>) => V,
): V;
```

Receives an Ariakit store object (which can be `null` or `undefined`) or a provider component (for example, `ComboboxProvider`) and returns the current state. When a provider component is passed, the store is read from the closest context of that provider's kind (set by that provider, an extending provider, or a compatible container component), skipping less specific store contexts. If a key is provided as the second argument, it returns the value of that key. If a selector function is provided, the state is passed to it, and its return value is used.

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

Accessing the state of a store that may be `null` or `undefined` (for
example, using a context):

```js
const combobox = Ariakit.useComboboxContext();
const value = Ariakit.useStoreState(combobox, "value");
```

Example:

Passing a provider component instead of a store object, in which case the
store is read from the closest context of that provider's kind:

```js
const value = Ariakit.useStoreState(Ariakit.ComboboxProvider, "value");
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `useStoreStateObject`

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
>(store: T, object: O): StoreStateObjectResult<T, StoreState<T>, O>;
function useStoreStateObject<
  T extends CoreStore,
  O extends StoreStateObject<T, StoreState<T> | undefined>,
>(
  store: StateStore<T> | ProviderComponent<T>,
  object: O,
): StoreStateObjectResult<T, StoreState<T> | undefined, O>;
```

Receives an Ariakit store object (which can be `null` or `undefined`) or a provider component (for example, `ComboboxProvider`) and returns the current state. Unlike `useStoreState`, this hook receives an object with keys that map to store keys or selector functions. When a provider component is passed, the store is read from the closest context of that provider's kind (set by that provider, an extending provider, or a compatible container component), skipping less specific store contexts.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `useStoreProps`

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

#### `useStore`

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

#### `Store`

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

### System utilities

Helpers for creating and composing Ariakit React components.

#### `ProviderComponent`

```ts
interface ProviderComponentBrand<T extends Store = Store> {
  /**
   * Phantom property that carries the provider's store type. It makes provider
   * components assignable to `ProviderComponent` types of base stores (for
   * example, `ComboboxProvider` to `ProviderComponent<CompositeStore>`), which
   * wouldn't be possible if the store type only appeared in the invariant
   * `React.Context` position. Never set at runtime.
   */
  store?: T;
}

interface ProviderComponent<T extends Store = Store> {
  readonly [providerComponentSymbol]: ProviderComponentBrand<T>;
}
```

A provider component (for example, `ComboboxProvider`) that can be passed to store props and [`useStoreState`](https://ariakit.com/reference/use-store-state) in place of a store object. The store is then read from the closest context of that provider's kind (set by that provider, an extending provider, or a compatible container component), skipping less specific store contexts.

If no such context is found, the store resolves to `undefined`. Components composed from multiple layers may still bind lower-level behavior to their own contexts in that case.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

<!-- ariakit-docs:end -->
