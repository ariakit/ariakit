# @ariakit/react-utils

**Important:** This package is an internal dependency of Ariakit and does not follow semantic versioning, meaning breaking changes may occur in patch and minor versions. You probably want to use [`@ariakit/react`](https://npmjs.org/package/@ariakit/react) instead.

Shared React utilities used by Ariakit React packages.

## Contents

- [Installation](#installation)
- [Usage](#usage)
- [API reference](#api-reference)

## Installation

```sh
npm i @ariakit/react-utils
```

## Usage

Import helpers from the package root:

```ts
import { useEvent } from "@ariakit/react-utils";
```

This package is ESM-only and exposes a single public entrypoint.

<!-- ariakit-docs:start -->

## API reference

- [Hooks](#hooks)
  - [`useSafeLayoutEffect`](#usesafelayouteffect)
  - [`useInitialValue`](#useinitialvalue)
  - [`useLazyValue`](#uselazyvalue)
  - [`useLiveRef`](#useliveref)
  - [`usePreviousValue`](#usepreviousvalue)
  - [`useEvent`](#useevent)
  - [`useTransactionState`](#usetransactionstate)
  - [`useMergeRefs`](#usemergerefs)
  - [`useId`](#useid)
  - [`useDeferredValue`](#usedeferredvalue)
  - [`useTagName`](#usetagname)
  - [`useAttribute`](#useattribute)
  - [`useUpdateEffect`](#useupdateeffect)
  - [`useUpdateLayoutEffect`](#useupdatelayouteffect)
  - [`useForceUpdate`](#useforceupdate)
  - [`useBooleanEvent`](#usebooleanevent)
  - [`useWrapElement`](#usewrapelement)
  - [`usePortalRef`](#useportalref)
  - [`useMetadataProps`](#usemetadataprops)
  - [`useIsMouseMoving`](#useismousemoving)
- [General utilities](#general-utilities)
  - [`setRef`](#setref)
  - [`isValidElementWithRef`](#isvalidelementwithref)
  - [`getRefProperty`](#getrefproperty)
  - [`mergeProps`](#mergeprops)
- [System utilities](#system-utilities)
  - [`forwardRef`](#forwardref)
  - [`memo`](#memo)
  - [`createElement`](#createelement)
  - [`createHook`](#createhook)
  - [`createStoreContext`](#createstorecontext)
- [Type utilities](#type-utilities)
  - [`RenderProp`](#renderprop)
  - [`WrapElement`](#wrapelement)
  - [`Options`](#options)
  - [`HTMLProps`](#htmlprops)
  - [`Props`](#props)
  - [`Hook`](#hook)

### Hooks

React hooks for refs, events, ids, effects, and element metadata.

#### `useSafeLayoutEffect`

```ts
const useSafeLayoutEffect: typeof React.useLayoutEffect;
```

`React.useLayoutEffect` that fallbacks to `React.useEffect` on server side.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `useInitialValue`

```ts
function useInitialValue<T>(value: T | (() => T)): T;
```

Returns a value that never changes even if the argument is updated.

Example:

```ts
function Component({ prop }) {
  const initialProp = useInitialValue(prop);
}
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `useLazyValue`

```ts
function useLazyValue<T>(init: () => T): T;
```

Returns a value that is lazily initiated and never changes.

Example:

```ts
function Component() {
  const set = useLazyValue(() => new Set());
}
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `useLiveRef`

```ts
function useLiveRef<T>(value: T): RefObject<T>;
```

Creates a `React.RefObject` that is constantly updated with the incoming value.

Example:

```ts
function Component({ prop }) {
  const propRef = useLiveRef(prop);
}
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `usePreviousValue`

```ts
function usePreviousValue<T>(value: T): T;
```

Keeps the reference of the previous value to be used in the render phase.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `useEvent`

```ts
function useEvent<T extends AnyFunction>(callback?: T): T;
```

Creates a stable callback function that has access to the latest state and can be used within event handlers and effect callbacks. Throws when used in the render phase.

Example:

```ts
function Component(props) {
  const onClick = useEvent(props.onClick);
  React.useEffect(() => {}, [onClick]);
}
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `useTransactionState`

```ts
function useTransactionState<T>(
  callback?: ((state: SetStateAction<T | null>) => void) | null,
): readonly [T | null, React.Dispatch<SetStateAction<T | null>>];
```

Creates a React state that calls a callback function whenever the state changes and rolls back to the previous state on cleanup.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `useMergeRefs`

```ts
function useMergeRefs(
  ...refs: Array<Ref<any> | undefined>
): ((value: unknown) => void) | undefined;
```

Merges React Refs into a single memoized function ref so you can pass it to an element.

Example:

```ts
const Component = React.forwardRef((props, ref) => {
  const internalRef = React.useRef();
  return <div {...props} ref={useMergeRefs(internalRef, ref)} />;
});
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `useId`

```ts
function useId(defaultId?: string): string | undefined;
```

Generates a unique ID. Uses React's useId if available.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `useDeferredValue`

```ts
function useDeferredValue<T>(value: T): T;
```

Uses React's useDeferredValue if available.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `useTagName`

```ts
function useTagName(
  refOrElement?: RefObject<HTMLElement | null> | HTMLElement | null,
  type?: string | ComponentType,
): string | undefined;
```

Returns the tag name by parsing an element ref.

Example:

```ts
function Component(props) {
  const ref = React.useRef();
  const tagName = useTagName(ref, "button"); // div
  return <div ref={ref} {...props} />;
}
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `useAttribute`

```ts
function useAttribute(
  refOrElement: RefObject<HTMLElement | null> | HTMLElement | null,
  attributeName: string,
  defaultValue?: string,
): string | undefined;
```

Returns the attribute value of an element.

Example:

```ts
function Component(props) {
  const ref = React.useRef();
  const role = useAttribute(ref, "role", props.role);
  return <div ref={ref} {...props} />;
}
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `useUpdateEffect`

```ts
function useUpdateEffect(effect: EffectCallback, deps?: DependencyList): void;
```

A `React.useEffect` that will not run on the first render.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `useUpdateLayoutEffect`

```ts
function useUpdateLayoutEffect(
  effect: EffectCallback,
  deps?: DependencyList,
): void;
```

A `React.useLayoutEffect` that will not run on the first render.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `useForceUpdate`

```ts
function useForceUpdate(): [never[], React.ActionDispatch<[]>];
```

A React hook similar to `useState` and `useReducer`, but with the only purpose of re-rendering the component.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `useBooleanEvent`

```ts
function useBooleanEvent<T extends unknown[]>(
  booleanOrCallback: boolean | ((...args: T) => boolean),
): (...args: T) => boolean;
```

Returns an event callback similar to `useEvent`, but this also accepts a boolean value, which will be turned into a function.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `useWrapElement`

```ts
function useWrapElement<P>(
  props: P & { wrapElement?: WrapElement },
  callback: WrapElement,
  deps: DependencyList = [],
): P & { wrapElement: WrapElement };
```

Returns props with an additional `wrapElement` prop.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `usePortalRef`

```ts
function usePortalRef(
  portalProp = false,
  portalRefProp?:
    | RefCallback<HTMLElement>
    | MutableRefObject<HTMLElement | null>,
): {
  portalRef: ((value: unknown) => void) | undefined;
  portalNode: HTMLElement | null;
  domReady: true | HTMLElement | null;
};
```

Merges the portalRef prop and returns a `domReady` to be used in the components that use Portal underneath.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `useMetadataProps`

```ts
function useMetadataProps<T, K extends keyof any>(
  props: { onLoadedMetadataCapture?: AnyFunction & { [key in K]?: T } },
  key: K,
  value: T,
): readonly [
  (AnyFunction & { [key in K]?: T | undefined })[K] | undefined,
  { readonly onLoadedMetadataCapture: any },
];
```

A hook that passes metadata props around without leaking them to the DOM.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `useIsMouseMoving`

```ts
function useIsMouseMoving(): () => boolean;
```

Returns a function that checks whether the mouse is moving.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### General utilities

Helpers for working with refs, elements, and props.

#### `setRef`

```ts
function setRef<T>(
  ref: RefCallback<T> | MutableRefObject<T> | null | undefined,
  value: T,
): void;
```

Sets both a function and object React ref.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `isValidElementWithRef`

```ts
function isValidElementWithRef<P extends { ref?: Ref<any> }>(
  element: unknown,
): element is ReactElement<P> & { ref?: Ref<any> };
```

Checks if an element is a valid React element with a ref.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `getRefProperty`

```ts
function getRefProperty(element: unknown): Ref<any> | undefined;
```

Gets the ref property from a React element.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `mergeProps`

```ts
function mergeProps<T extends HTMLAttributes<any>>(base: T, overrides: T): T;
```

Merges two sets of props.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### System utilities

Helpers for creating and composing Ariakit React components.

#### `forwardRef`

```ts
function forwardRef<T extends React.FC<any>>(render: T): T;
```

The same as `React.forwardRef` but passes the `ref` as a prop and returns a component with the same generic type.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `memo`

```ts
function memo<T extends React.FC<any>>(
  Component: T,
  propsAreEqual?: (
    prevProps: Readonly<React.ComponentPropsWithoutRef<T>>,
    nextProps: Readonly<React.ComponentPropsWithoutRef<T>>,
  ) => boolean,
): T;
```

The same as `React.memo` but returns a component with the same generic type.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `createElement`

```ts
function createElement(
  Type: React.ElementType,
  props: Props<React.ElementType, Options>,
): React.ReactElement<unknown, string | React.JSXElementConstructor<any>>;
```

Creates a React element that supports the `render` and `wrapElement` props.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `createHook`

```ts
function createHook<
  T extends React.ElementType,
  P extends AnyObject = EmptyObject,
>(useProps: (props: Props<T, P>) => HTMLProps<T, P>): Hook<T, P>;
```

Creates a component hook that accepts props and returns props so they can be passed to a React element.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `createStoreContext`

```ts
type StoreProvider<T extends Store> = React.ComponentType<{
  value: T | undefined;
  children?: React.ReactNode;
}>;

function createStoreContext<T extends Store>(
  providers: StoreProvider<T>[] = [],
  scopedProviders: StoreProvider<T>[] = [],
): {
  context: React.Context<T | undefined>;
  scopedContext: React.Context<T | undefined>;
  useContext: () => T | undefined;
  useScopedContext: (onlyScoped?: boolean) => T | undefined;
  useProviderContext: () => T | undefined;
  ContextProvider: (
    props: React.ComponentPropsWithoutRef<React.Provider<T | undefined>>,
  ) => import("react/jsx-runtime").JSX.Element;
  ScopedContextProvider: (
    props: React.ComponentPropsWithoutRef<React.Provider<T | undefined>>,
  ) => import("react/jsx-runtime").JSX.Element;
};
```

Creates an Ariakit store context with hooks and provider components.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

### Type utilities

Shared types for Ariakit React components.

#### `RenderProp`

```ts
type RenderProp<P = React.HTMLAttributes<any> & { ref?: React.Ref<any> }> = (
  props: P,
) => React.ReactNode;
```

Render prop type.

Example:

```ts
const children: RenderProp = (props) => <div {...props} />;
```

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `WrapElement`

```ts
type WrapElement = (element: React.ReactElement) => React.ReactElement;
```

The `wrapElement` prop.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `Options`

```ts
interface Options {
  wrapElement?: WrapElement;
  /**
   * Allows the component to be rendered as a different HTML element or React
   * component. The value can be a React element or a function that takes in the
   * original component props and gives back a React element with the props
   * merged.
   *
   * Check out the [Composition](https://ariakit.com/guide/composition) guide
   * for more details.
   */
  render?: RenderProp | React.ReactElement;
}
```

Custom props including the `render` prop.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `HTMLProps`

```ts
type HTMLProps<
  T extends React.ElementType,
  P extends AnyObject = EmptyObject,
> = Omit<React.ComponentPropsWithRef<T>, keyof P> & {
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
type Props<T extends React.ElementType, P extends AnyObject = EmptyObject> = P &
  HTMLProps<T, P>;
```

Props based on the element type, including custom props.

<div align="right">
  <a href="#api-reference">&uarr; back to top</a>
</div>

#### `Hook`

```ts
type Hook<T extends React.ElementType, P extends AnyObject = EmptyObject> = <
  ElementType extends React.ElementType = T,
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
