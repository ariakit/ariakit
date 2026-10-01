# Contributing to Ariakit Solid

Ariakit Solid is a port of Ariakit React to Solid 2. Its goal is the same API, behavior, accessibility, and component composition, with React-specific code translated into Solid's rendering and reactivity model. Framework-independent utilities and stores remain shared.

React remains the reference for behavior; differences on the Solid side address framework constraints rather than introduce a separate component design.

This guide explains those translations through code comparisons and their rationale. See the [repository guide](../../contributing.md) for setup and [#7687](https://github.com/ariakit/ariakit/issues/7687) for progress.

## Rendering system

Compare [React's `createElement`](../ariakit-react-utils/src/system.tsx) with [Solid's implementation](../ariakit-solid-utils/src/system.tsx). Both select an underlying element, forward props, and apply `wrapElement`.

For the callback/default path, React creates an element description and then wraps it:

```tsx
const { wrapElement, render, ...rest } = props;
const element = render ? render(rest) : <Type {...rest} />;
return wrapElement ? wrapElement(element) : element;
```

Solid keeps props live and defers element creation until the wrapper is in place:

```tsx
const rest = omit(props, "render", "wrapElement");
const Render = dynamic(() => props.render ?? Type);
const renderElement = () => <Render {...rest} />;
const Element = dynamic(() => {
  const wrapElement = props.wrapElement;
  return wrapElement ? () => wrapElement(renderElement) : renderElement;
});
return <Element />;
```

The key difference is what gets wrapped: React passes an element description; Solid passes a function that creates the subtree inside the wrapper's context. React's additional element-cloning branch is covered under [element-form rendering](#element-form-rendering).

### Keep forwarded props reactive

React separates rendering options with object rest:

```ts
const { wrapElement, render, ...rest } = props;
```

React runs the component again on updates, so this copy contains the current values. Solid normally runs the component once; an eager copy can capture values that should keep changing. Solid therefore uses a live filtered view:

```ts
const rest = omit(props, "render", "wrapElement");
```

`omit` keeps reads connected to the original props and prevents internal rendering options from reaching the DOM. It filters props; it does not merge handlers, apply defaults, or compose refs.

The same rule applies when constructing props manually:

```tsx
createElement("div", {
  get children() {
    return count();
  },
});
```

`children: count()` would read the signal while constructing the object. The getter lets the renderer read it reactively. Direct JSX expressions and spreads are handled by Solid's compiler.

### Select the element or render callback

React's helper has three branches: clone a supplied React element with merged props, call a render callback, or render the default `Type`.

Solid currently implements the callback and default branches:

```tsx
const Render = dynamic(() => props.render ?? Type);
const renderElement = () => <Render {...rest} />;
```

Solid 2's `dynamic` tracks the renderer selection and owns the rendered subtree. `renderElement` defers creation so a wrapper can establish context first.

```tsx
createElement("button", {
  children: "Save",
  render: (props) => <button {...props} type="button" />,
});
```

As in React's callback branch, the callback decides where to forward children, attributes, events, and refs. Additional callback props are not automatically composed: `onClick={myHandler}` after `{...props}` can replace the forwarded handler.

Changing the renderer can replace the subtree. Component hooks that detect their underlying element only during setup need separate handling; renderer replacement alone does not rerun those hooks. React documents this constraint in its [render options](../ariakit-react-utils/src/types.ts).

### Create children under the wrapper

React passes an element description to `wrapElement`:

```tsx
// React
wrapElement: (element) => (
  <Context.Provider value="Wrapped">{element}</Context.Provider>
);
```

The child components execute later under the provider. Solid JSX can instantiate children when evaluated, so Solid passes a function that creates the subtree:

```tsx
// Solid
wrapElement: (element) => <Context value="Wrapped">{element()}</Context>;
```

Calling `element()` inside the provider gives the subtree that context and its cleanup scope. Creating the subtree first and wrapping the resulting value is too late.

The outer `dynamic` selects whether to use the wrapper:

```tsx
const Element = dynamic(() => {
  const wrapElement = props.wrapElement;
  return wrapElement ? () => wrapElement(renderElement) : renderElement;
});
return <Element />;
```

The inner selector chooses the renderer; the outer selector chooses its wrapper. Returning a function delays wrapper execution until rendering. This preserves ownership, but changes React's wrapper argument from an element to a factory that must be called at the intended location.

When manually supplying child JSX, use a getter if creation must happen under the wrapper. This is how the [Solid context fixture](../ariakit-solid-utils/src/system.solid.test.tsx) creates its context-reading child.

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

| Type            | Solid translation                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------------- |
| `HTMLProps<T>`  | Solid's `ComponentProps<T>` plus `data-*` attributes, instead of React's `ComponentPropsWithRef<T>`. |
| `RenderProp<T>` | Receives `HTMLProps<T>` and returns Solid `JSX.Element`, instead of React `ReactNode`.               |
| `WrapElement`   | Receives `() => JSX.Element` instead of a React element, preserving creation timing.                 |
| `Options<T>`    | Declares internal `render` and `wrapElement` options.                                                |
| `Props<T>`      | Combines element props with those options.                                                           |

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

React's `createHook` returns props that another component hook can extend. Its Solid equivalent must keep reads reactive through each layer. The previous port used `createHook` and `withOptions` for hook wrapping, option extraction, and defaults. Neither is rebuilt yet. Multiple hooks also need to compose wrappers in a defined order, rather than replacing one another's `wrapElement`.

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
- The [shared fixture loader](../../vitest.setup.framework.ts) mounts Solid fixtures with `createComponent`, `Loading`, and web `render`, then disposes them after the test. The system tests mount their own fixtures.

The Astro app and legacy website still have Solid 1 integrations. New Solid 2 fixtures need compatible preview wiring before they can run there. For lifecycle translations, consult the [Solid 2 migration guide](https://v2.solidjs.com/migration/from-solid-1): scheduling and effects changed, so React effects cannot be translated by name alone.

Package builds rewrite export metadata. Build separately, then clean before tests and type checks:

```sh
pnpm -F @ariakit/solid-utils run build
pnpm clean
pnpm tsc
pnpm test system.react.test.tsx system.solid.test.tsx --run
pnpm lint-fix
```
