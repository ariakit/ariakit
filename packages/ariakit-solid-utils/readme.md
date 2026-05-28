# @ariakit/solid-utils

**Important:** This package is an internal dependency of Ariakit and does not follow semantic versioning, meaning breaking changes may occur in patch and minor versions.

Shared Solid utilities used by Ariakit Solid packages.

## Contents

- [Installation](#installation)
- [Usage](#usage)
- [API reference](#api-reference)

## Installation

```sh
npm i @ariakit/solid-utils
```

## Usage

Import helpers from the package root:

```ts
import { mergeProps } from "@ariakit/solid-utils";
```

This package is ESM-only and exposes a single public entrypoint.

<!-- ariakit-docs:start -->

## API reference

- [General utilities](#general-utilities)
  - [`createId`](#createid)
  - [`extractTagName`](#extracttagname)
- [Reactivity utilities](#reactivity-utilities)
  - [`stableAccessor`](#stableaccessor)
  - [`ExtractPropsWithDefaultsExtractedProps`](#extractpropswithdefaultsextractedprops)
  - [`ExtractPropsWithDefaultsRestProps`](#extractpropswithdefaultsrestprops)
  - [`ExtractPropsWithDefaultsReturn`](#extractpropswithdefaultsreturn)
  - [`extractPropsWithDefaults`](#extractpropswithdefaults)
  - [`RefStore`](#refstore)
  - [`createRef`](#createref)
  - [`mergeProps`](#mergeprops)
- [System utilities](#system-utilities)
  - [`createInstance`](#createinstance)
  - [`wrapInstance`](#wrapinstance)
  - [`createHook`](#createhook)
  - [`withOptions`](#withoptions)
- [Type utilities](#type-utilities)
  - [`RenderValue`](#rendervalue)
  - [`WrapInstanceValue`](#wrapinstancevalue)
  - [`WrapInstance`](#wrapinstance-1)
  - [`Options`](#options)
  - [`HTMLProps`](#htmlprops)
  - [`Props`](#props)
  - [`Hook`](#hook)

### General utilities

Helpers for ids and tag names.

#### `createId`

```ts
function createId(
  defaultId?: MaybeAccessor<string | undefined>,
): Accessor<string>;
```

Generates a unique ID.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `extractTagName`

```ts
function extractTagName(
  element?: MaybeAccessor<HTMLElement | undefined>,
  fallback?: ValidComponent,
): () => any;
```

Returns the tag name by parsing an element.

Example:

```ts
function Component(props) {
  const [ref, setRef] = createSignal();
  const tagName = extractTagName(ref, "button"); // () => "div"
  return <div ref={setRef} {...props} />;
}
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### Reactivity utilities

Reactivity helpers for accessors, signals, props, and refs.

#### `stableAccessor`

```ts
function stableAccessor<T, U>(value: T, callback: (value: T) => U): () => U;
```

Creates a stable accessor. Useful when creating derived accessors that depend on a mutable variable that may change later.

Example:

```ts
let value = 0;
const accessor = stableAccessor(value, (v) => v + 1);
value = 100;
accessor(); // 1
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `ExtractPropsWithDefaultsExtractedProps`

```ts
type NullablyRequired<T> = { [P in keyof T & keyof any]: T[P] };

type ExtractPropsWithDefaultsExtractedProps<
  P,
  D extends Partial<R>,
  R = NullablyRequired<P>,
> = {
  -readonly [K in keyof R as Extract<K, keyof D>]: D[K] extends undefined
    ? R[K]
    : Exclude<R[K], undefined>;
};
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `ExtractPropsWithDefaultsRestProps`

```ts
type ExtractPropsWithDefaultsRestProps<P, D extends Partial<P>> = Omit<
  P,
  keyof D
>;
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `ExtractPropsWithDefaultsReturn`

```ts
type ExtractPropsWithDefaultsReturn<P, D extends Partial<P>> = [
  ExtractPropsWithDefaultsExtractedProps<P, D>,
  ExtractPropsWithDefaultsRestProps<P, D>,
];
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `extractPropsWithDefaults`

```ts
function extractPropsWithDefaults<
  P extends AnyObject,
  const D extends Partial<P>,
>(props: P, defaults: D): ExtractPropsWithDefaultsReturn<P, D>;
```

Extracts props from a props object and applies defaults to them. The return value is a tuple of the extracted props and the rest of the props.

To extract a prop without a default, set it to `undefined`.

Example:

```ts
const [extractedProps, restProps] = extractPropsWithDefaults(props, {
  orientation: "horizontal",
});
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `RefStore`

````ts
type RefStore<T> = {
  /**
   * The current value of the ref. It is a non-reactive getter, wrapped with
   * the `untrack` function.
   *
   * **Important note**: since this is a getter, TypeScript might reflect the
   * wrong type in some cases. For example:
   *
   * ```ts
   * const ref = createRef<number>(); // ref.current type: number | undefined
   * ref.set(1);
   * console.log(ref.current); // 1
   * if (ref.current) {
   *   // ref.current type: number (narrowed by the if statement)
   // ... 18 more lines
   * by default.
   */
  reset: () => void;
};
````

A ref object that contains the value getter (`value`) and setter (`set`) as properties for convenience. It also has a `reset` method that can be used to set the value to the initial value that was passed, which is `undefined` by default. The `current` getter can be used to obtain the value without tracking it reactively.

Created by the `createRef` function.

Example:

```ts
const ref = createRef();
createEffect(() => {
  console.log(ref.value);
});
ref.set(buttonElement);
ref.reset();
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `createRef`

```ts
function createRef<T>(): RefStore<T | undefined>;
function createRef<T>(initialValue: T): RefStore<T>;
```

Creates a ref object that contains the value getter (`value`) and setter (`set`) as properties for convenience. It also has a `reset` method that can be used to set the value to the initial value that was passed, which is `undefined` by default. The `current` getter can be used to obtain the value without tracking it reactively.

Example:

```jsx
const ref = createRef();
createEffect(() => {
  console.log(ref.value);
});
<button ref={ref.set}>Button</button>;
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `mergeProps`

```ts
function mergeProps<T extends JSX.HTMLAttributes<any>>(
  base: T,
  overrides: T,
  skipProps?: Array<keyof T>,
): T;
```

Merges two sets of props.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### System utilities

Helpers for creating and composing Ariakit Solid components.

#### `createInstance`

```ts
function createInstance(
  Component: ValidComponent,
  props: Props<ValidComponent, Options>,
): import("solid-js").JSX.Element;
```

Creates a Solid component instance that supports the `render` and `wrapInstance` props.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `wrapInstance`

```ts
function wrapInstance<P, Q = P & { wrapInstance: WrapInstance }>(
  props: P & { wrapInstance?: WrapInstance },
  element: WrapInstanceValue,
): Q;
```

Returns props with an additional `wrapInstance` prop.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `createHook`

```ts
function createHook<
  T extends ValidComponent,
  P extends AnyObject = EmptyObject,
>(useProps: (props: Props<T, P>) => HTMLProps<T, P>): Hook<T, P>;
```

Creates a component hook that accepts props and returns props so they can be passed to a Solid component.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `withOptions`

```ts
function withOptions<
  T extends ValidComponent,
  P extends AnyObject,
  const D extends Partial<ComputedP>,
  ComputedP extends Props<T, P>,
>(
  defaults: D,
  useProps: (
    props: ExtractPropsWithDefaultsRestProps<ComputedP, D>,
    options: ExtractPropsWithDefaultsExtractedProps<ComputedP, D>,
  ) => HTMLProps<T, P>,
): (props: ComputedP) => HTMLProps<T, P>;
```

Splits "option props" from the rest in a component hook. Must be called inside `createHook`.

The first argument is an object that defines the props that will be extracted, with their default values. To extract a prop without a default, set it to `undefined`.

The hook function must be passed as the second argument, and it will receive the rest of the props and the extracted options.

Example:

```jsx
export const useMyComponent = createHook<TagName, MyComponentOptions>(
  withOptions(
    { orientation: "horizontal" },
    function useMyComponent(props, options) {
      // ...
    },
  ),
);
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### Type utilities

Shared types for Ariakit Solid components.

#### `RenderValue`

```ts
type RenderValue<P extends AnyObject> = JSX.Element | Component<P>;
```

A value that can be rendered when passed to the `render` prop or the `wrapInstance` prop.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `WrapInstanceValue`

```ts
type WrapInstanceValue = RenderValue<ParentProps>;
```

A value passed to the `wrapInstance` prop.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `WrapInstance`

```ts
type WrapInstance = Array<WrapInstanceValue>;
```

The `wrapInstance` prop.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `Options`

```ts
interface Options {
  wrapInstance?: WrapInstance;
  /**
   * Allows the component to be rendered as a different HTML element or Solid
   * component. The value can be an `As` component instance or a function that
   * takes in the original component props and gives back a Solid component
   * instance with the props merged.
   *
   * Check out the [Composition](https://solid.ariakit.com/guide/composition) guide
   * for more details.
   */
  render?: RenderValue<JSX.HTMLAttributes<any>>;
}
```

Custom props including the `render` prop.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `HTMLProps`

```ts
type HTMLProps<
  T extends ValidComponent,
  P extends AnyObject = EmptyObject,
> = Omit<ComponentProps<T>, keyof P> & {
  [index: `data-${string}`]: unknown;
};
```

HTML props based on the element type, excluding custom props.

Example:

```ts
type ButtonHTMLProps = HTMLProps<"button", { custom?: boolean }>;
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `Props`

```ts
type Props<T extends ValidComponent, P extends AnyObject = EmptyObject> = P &
  HTMLProps<T, P>;
```

Props based on the element type, including custom props.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `Hook`

```ts
type Hook<T extends ValidComponent, P extends AnyObject = EmptyObject> = <
  ElementType extends ValidComponent = T,
>(
  props?: Props<ElementType, P>,
) => HTMLProps<ElementType, P>;
```

A component hook that supports the `render` prop and returns HTML props based on the element type.

Example:

```ts
type UseButton = Hook<"button", { custom?: boolean }>;
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

<!-- ariakit-docs:end -->
