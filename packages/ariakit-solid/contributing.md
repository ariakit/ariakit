# Contributing to Ariakit Solid

Ariakit Solid is a port of Ariakit React to Solid 2. Its goal is the same API, behavior, accessibility, and component composition, with React-specific code translated into Solid's rendering and reactivity model. Framework-independent utilities and stores remain shared.

React remains the reference for behavior; differences on the Solid side address framework constraints rather than introduce a separate component design.

This guide explains those translations and their rationale. See the [repository guide](../../contributing.md) for setup and [#7687](https://github.com/ariakit/ariakit/issues/7687) for progress.

## Component structure

### React: behavior hooks and rendering components

The standard pattern for Ariakit React components that render DOM elements has two parts:

- A **behavior hook**, such as `useButton`, receives props and returns props with the component's accessibility attributes, event handlers, and refs. It can also manage state, effects, and context.
- A **component**, such as `Button`, receives the props supplied in JSX, calls that hook, then renders the returned props with `createElement`.

For example, [React's Button](../ariakit-react-components/src/button/button.tsx) renders like this:

```tsx
function Button(props) {
  const htmlProps = useButton(props);
  return createElement(TagName, htmlProps);
}
```

Context-only components such as [DialogProvider](../ariakit-react-components/src/dialog/dialog-provider.tsx) and [HeadingLevel](../ariakit-react-components/src/heading/heading-level.tsx) do not use this prop-hook/rendering split.

Here `TagName` is `"button"` and `props` comes from `<Button ... />`.

Hooks compose behavior by calling other hooks and passing props through them. `useButton` adds button semantics and calls [useCommand](../ariakit-react-components/src/command/command.tsx) for keyboard activation; `useCommand` calls [useFocusable](../ariakit-react-components/src/focusable/focusable.tsx) for focus behavior. The returned props carry all those layers to the renderer.

Here is that prop flow inside the hooks, abbreviated to show composition. State, effects, handler implementations, and the `createHook` wrappers are omitted:

```tsx
function useButton(props) {
  // Setup above computes ref, tagName, and isNativeButton.
  props = {
    role: !isNativeButton && tagName !== "a" ? "button" : undefined,
    ...props,
    ref: useMergeRefs(ref, props.ref),
  };

  props = useCommand(props);
  return props;
}

function useCommand(props) {
  // Setup above creates keyboard handlers and other command props.
  props = {
    ...props,
    onKeyDown,
    onKeyUp,
    onBlur,
  };

  props = useFocusable(props);
  return props;
}
```

Each hook adds its own props and passes the result to the next hook. `useButton` does not render a `Command` component; it incorporates `useCommand`'s returned props into the props that `Button` eventually renders.

### Solid: the same hooks and components

The Solid port keeps this structure: hooks accept props, call other prop hooks, and return props; components render the result. Solid runs the component and its hooks during setup, then updates through reactive computations instead of rerunning them as React does.

The sections below explain that translation starting with Solid's `createInstance` (React's `createElement`), then prop types and prop composition. Component hooks are not implemented yet; their state and lifecycle translations will be documented alongside their implementations.

## Rendering system

React's `createElement(Type, props)` renders the default tag (`Type`) unless the [render prop](https://ariakit.com/guide/composition) supplies a replacement. `wrapElement` wraps the rendered element, for example in a context provider.

[React's helper](../ariakit-react-utils/src/system.tsx) creates a React element, which React renders afterward. Its callback/default branches can be summarized as:

```tsx
function createElement(Type, props) {
  const { wrapElement, render, ...rest } = props;
  const element = render ? render(rest) : <Type {...rest} />;
  return wrapElement ? wrapElement(element) : element;
}
```

[Solid's `createInstance`](../ariakit-solid-utils/src/system.tsx) performs the same work using [`omit`](https://v2.solidjs.com/reference/solid-js/stores/omit) from `solid-js` and [`dynamic`](https://v2.solidjs.com/reference/solid-web/components/dynamic) from `@solidjs/web`.

```tsx
import { dynamic } from "@solidjs/web";
import { omit } from "solid-js";

function createInstance(Type, props) {
  const rest = omit(props, "render", "wrapInstance");
  const Render = dynamic(() => props.render ?? Type);
  const renderContent = () => <Render {...rest} />;
  const Element = dynamic(() => {
    const wrapInstance = props.wrapInstance;
    return wrapInstance ? () => wrapInstance(renderContent) : renderContent;
  });
  return <Element />;
}
```

The names `createInstance` and `wrapInstance` reflect how Solid runs components when JSX is evaluated, while React creates elements for later rendering.

In both helpers, `Type` is a tag name such as `"div"` or the component function itself, such as `MyComponent`, not `<MyComponent />`.

### 1. Omit rendering options

Instead of React's object rest destructuring, Solid uses [`omit`](https://v2.solidjs.com/reference/solid-js/stores/omit) to exclude `render` and `wrapInstance` from the forwarded props while preserving reactive reads.

```ts
const rest = omit(props, "render", "wrapInstance");
```

### 2. Select the renderer

Solid selects the render callback or default `Type` with [`dynamic`](https://v2.solidjs.com/reference/solid-web/components/dynamic):

```tsx
const Render = dynamic(() => props.render ?? Type);
```

If `props.render` changes, `dynamic` switches to the new renderer, or back to `Type` if `render` is removed.

### 3. Defer rendering

```tsx
const renderContent = () => <Render {...rest} />;
```

Keeping this in a function lets `wrapInstance` decide when to render it, as explained below.

### 4. Apply the wrapper

`wrapElement` can surround the component with a context provider. React passes it an element, whose components have not run yet:

```tsx
// React
wrapElement: (element) => (
  <Context.Provider value="Wrapped">{element}</Context.Provider>
);
```

In Solid, those components would run before the wrapper if we passed already-evaluated JSX. Instead, `wrapInstance` receives the `renderContent` function from the previous step:

```tsx
// Solid
wrapInstance: (renderInstance) => (
  <Context value="Wrapped">{renderInstance()}</Context>
);
```

Here, `renderInstance()` runs inside the provider, so the rendered components can read its `"Wrapped"` value.

The outer [`dynamic`](https://v2.solidjs.com/reference/solid-web/components/dynamic) selects whether to use the wrapper:

```tsx
const Element = dynamic(() => {
  const wrapInstance = props.wrapInstance;
  return wrapInstance ? () => wrapInstance(renderContent) : renderContent;
});
return <Element />;
```

When `<Element />` renders, it calls `wrapInstance(renderContent)` if a wrapper is supplied, or renders `renderContent` directly otherwise. `dynamic` updates this choice when `wrapInstance` changes.

### Element-form rendering

React also accepts `render={<button />}`. Its helper reads the element's props and ref, merges them with Ariakit's, then clones the element.

> **WIP:** Element-form rendering is not implemented yet in Solid.

## Prop types

| Type         | [Ariakit React](../ariakit-react-utils/src/types.ts)                                                         | [Ariakit Solid](../ariakit-solid-utils/src/types.ts)                                                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `HTMLProps`  | `HTMLProps<T, P>`: `ComponentPropsWithRef<T>` without custom-option keys from `P`, plus `data-*` attributes. | `HTMLProps<T>`: [`ComponentProps<T>`](https://v2.solidjs.com/reference/solid-js/types/component-types) plus `data-*` attributes.                   |
| `RenderProp` | `RenderProp<P>`: `(props: P) => ReactNode`.                                                                  | `RenderProp<T>`: `(props: HTMLProps<T>) => JSX.Element`, using Solid's [`JSX.Element`](https://v2.solidjs.com/reference/solid-js/types/jsx-types). |
| Wrapper      | `WrapElement`: `(element: ReactElement) => ReactElement`.                                                    | `WrapInstance`: `(content: () => JSX.Element) => JSX.Element`.                                                                                     |
| `Options`    | `Options`: `render` accepts an element or callback; `wrapElement` accepts a wrapper.                         | `Options<T>`: `render` accepts a callback; `wrapInstance` accepts a wrapper.                                                                       |
| `Props`      | `Props<T, P>`: `P & HTMLProps<T, P>`.                                                                        | `Props<T>`: `HTMLProps<T> & Options<T>`.                                                                                                           |

`T` is the tag name or component type. For example, `HTMLProps<"button">` gives the props accepted by a button.

> **WIP:** Custom-option types, polymorphic hook signatures, and element-form rendering types are not implemented yet in Solid.

## Prop composition and component hooks

React's element branch uses [mergeProps](../ariakit-react-utils/src/misc.ts) and [useMergeRefs](../ariakit-react-utils/src/hooks.ts).

React merges props as follows:

- Class names are combined; style objects are merged with override properties winning.
- Ordinary overrides holding `undefined` are ignored.
- Override event handlers run before base handlers; base handlers are preserved when an override is not a function. Component handlers may inspect `defaultPrevented`.
- Both Ariakit's ref and the supplied element's ref receive the element.

React's [forwardRef](../ariakit-react-utils/src/system.tsx) also removes `undefined` props before the component implementation runs. Keep this boundary rule separate from a live DOM attribute becoming `undefined`, which removes the attribute.

React's `createHook` wraps the prop hook described above.

> **WIP:** Prop composition and component hooks are not implemented yet in Solid.

## Shared tests

> **WIP:** Documentation for the shared React and Solid tests is coming soon.
