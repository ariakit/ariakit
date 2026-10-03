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

`renderContent()` renders `<Render {...rest} />`. Keeping it in a function lets `wrapInstance` decide when to render it, as explained below.

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

The [Solid context fixture](../ariakit-solid-utils/src/system.solid.test.tsx) tests this by reading the wrapper's context value from a child component.

### Element-form rendering

React also accepts `render={<button />}`. Its helper reads the element's props and ref, merges them with Ariakit's, then clones the element. Solid needs an equivalent deferred representation because an already-created DOM node cannot be cloned with the same component/context semantics.

**This form is required alongside callbacks and is not implemented yet.** The previous port's `As` delayed creation until Ariakit supplied props:

```tsx
// Previous port syntax, not currently available.
<Role render={<As.button type="button" />} />
<Role render={<As component={MyButton} />} />
```

That preserves convenient element syntax and allows prop composition before creation. The Solid 2 representation remains to be chosen; it must preserve live props, wrapper context, ref composition, and useful types.

## Prop types

Compare [React types](../ariakit-react-utils/src/types.ts) with [Solid types](../ariakit-solid-utils/src/types.ts).

| Type            | Solid translation                                                                                                                                                       |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `HTMLProps<T>`  | Solid's [`ComponentProps<T>`](https://v2.solidjs.com/reference/solid-js/types/component-types) plus `data-*` attributes, instead of React's `ComponentPropsWithRef<T>`. |
| `RenderProp<T>` | Receives `HTMLProps<T>` and returns Solid [`JSX.Element`](https://v2.solidjs.com/reference/solid-js/types/jsx-types), instead of React `ReactNode`.                     |
| `WrapInstance`  | Receives `() => JSX.Element` instead of React's `WrapElement` argument, preserving creation timing.                                                                     |
| `Options<T>`    | Declares internal `render` and `wrapInstance` options.                                                                                                                  |
| `Props<T>`      | Combines element props with those options.                                                                                                                              |

`T` connects the default renderer to its props. React also has a custom-options parameter, `Props<T, P>`, and removes custom-option keys from `HTMLProps<T, P>`. Those types, polymorphic hook signatures, and element-form rendering types still need translation.

## Prop composition and component hooks

React's element branch uses [mergeProps](../ariakit-react-utils/src/misc.ts) and [useMergeRefs](../ariakit-react-utils/src/hooks.ts). The Solid helper forwards props but does not yet implement this composition.

The React behavior to preserve is:

- Combine class names; merge style objects with override properties winning.
- Ignore ordinary overrides holding `undefined`.
- Run override event handlers before base handlers; preserve base handlers when an override is not a function. Component handlers may inspect `defaultPrevented`.
- Deliver the element to both Ariakit's ref and the supplied element's ref.

React's [forwardRef](../ariakit-react-utils/src/system.tsx) also removes `undefined` props before the component implementation runs. Keep this boundary rule separate from a live DOM attribute becoming `undefined`, which removes the attribute.

Solid's composition must retain these rules without copying reactive values into stale objects. Native prop merging alone does not establish Ariakit's handler, ref, or precedence semantics.

React's `createHook` wraps the prop hook described above. The previous Solid port also used `createHook` and `withOptions` for hook wrapping, option extraction, and defaults. Neither is rebuilt yet. Multiple hooks also need to compose wrappers in a defined order, rather than replacing one another's `wrapInstance`.

## Shared tests

[Shared assertions](../ariakit-test/src/__system-tests.ts) define the expected behavior. [React](../ariakit-react-utils/src/system.react.test.tsx) and [Solid](../ariakit-solid-utils/src/system.solid.test.tsx) fixtures provide their own state, refs, context, and mount/dispose functions.

This shares expectations while keeping framework setup separate. When adding a scenario, reproduce the same interaction in both fixtures. The current scenarios cover live props, attribute removal, DOM identity, renderer changes, events, refs, and wrapper context across remounting.

The Solid suite uses jsdom because happy-dom dropped numeric `0` when the native Solid renderer assigned it to `textContent`. This keeps the zero-child case covered without a production workaround. The suite does not yet cover element-form rendering, ref composition, SSR/hydration, or every wrapper change.

```sh
# Run from the repository root.
pnpm test system.react.test.tsx system.solid.test.tsx --run
```

## Solid 2 toolchain

- Web rendering and JSX types come from `@solidjs/web`; reactive primitives come from `solid-js`. Both currently use `2.0.0-rc.13`. Keep their versions compatible.
- [Library builds](../ariakit-scripts/src/build.ts) and [Vitest](../../vitest.config.ts) use `@solidjs/vite-plugin`. The builder emits DOM JavaScript and retains JSX source for consumer compilation.
- [Library](../../tsconfig.solid.json) and [test](../../tsconfig.solid.test.json) TypeScript configurations use `jsxImportSource: "@solidjs/web"`.
- The [shared fixture loader](../../vitest.setup.framework.ts) mounts Solid fixtures with [`Loading`](https://v2.solidjs.com/reference/solid-js/components-jsx/loading), and web [`render`](https://v2.solidjs.com/reference/solid-web/rendering-ssr/render), then disposes them after the test. The system tests mount their own fixtures.

The Astro app and legacy website still have Solid 1 integrations. New Solid 2 fixtures need compatible preview wiring before they can run there. Solid 2 API changes are documented in the [migration guide](https://v2.solidjs.com/migration/from-solid-1).

Package builds rewrite export metadata. Build separately, then clean before tests and type checks:

```sh
pnpm -F @ariakit/solid-utils run build
pnpm clean
pnpm tsc
pnpm test system.react.test.tsx system.solid.test.tsx --run
pnpm lint-fix
```
