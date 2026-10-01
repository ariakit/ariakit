# Contributing to Ariakit Solid

Ariakit Solid translates Ariakit React's logic into Solid while preserving its behavior, accessibility, public API, and component composition. React is the behavioral reference, including its browser workarounds. Framework-independent packages remain shared.

The implementation targets Solid 2. Work happens on `solid-reboot`, tracked in [#7687](https://github.com/ariakit/ariakit/issues/7687). This guide explains the implementation on this branch, its differences from React, and the decisions that remain open. See [Contributing](contributing.md) for repository setup.

## Contents

- [What exists today](#what-exists-today)
- [React and Solid execute differently](#react-and-solid-execute-differently)
- [Rendering, step by step](#rendering-step-by-step)
- [Prop types](#prop-types)
- [Composition that still needs implementation](#composition-that-still-needs-implementation)
- [Shared behavior tests](#shared-behavior-tests)
- [Compiler, dependencies, and builds](#compiler-dependencies-and-builds)
- [Developing the next pieces](#developing-the-next-pieces)
- [Keeping this guide useful](#keeping-this-guide-useful)

## What exists today

| Package                     | Responsibility                             | Current implementation                       |
| --------------------------- | ------------------------------------------ | -------------------------------------------- |
| `@ariakit/solid-utils`      | Framework helpers used by Solid components | Rendering helper and prop types              |
| `@ariakit/solid-store`      | Connect shared Ariakit stores to Solid     | Empty entrypoint; adapter not implemented    |
| `@ariakit/solid-components` | Component and hook implementations         | Empty entrypoint; components not implemented |
| `@ariakit/solid`            | Consumer-facing exports                    | Empty entrypoint; components not exported    |

The empty packages retain their manifests and reusable build wiring. Their existence does not mean their features are ported. Likewise, a matching Solid source file in a dependency map is evidence of structure, not proof of behavioral parity.

The rendering helper currently supports default elements, render callbacks, live forwarded props, and lazy wrapping. The element-form equivalent of React's `render={<button />}` is required but not implemented. Callback support does not replace that requirement.

## React and Solid execute differently

In React, a component function can run again when state or props change. Destructuring props and constructing another props object during that render produces a fresh result for that render. React then reconciles the resulting element descriptions with the mounted tree.

In Solid, a component normally runs once to establish its reactive work. Signal and prop reads inside tracked computations drive subsequent updates. Remounting still creates a new component instance, but a changing prop does not generally rerun the component body.

This distinction changes how we translate code:

```tsx
// React: reads the current title on each render.
const { title } = props;
return <div title={title} />;

// Solid: keep the read connected to the original props.
return <div title={props.title} />;
```

A Solid read outside a tracked computation can capture only the value at setup time. Similarly, spreading reactive props into a plain object outside tracking can turn live getters into snapshots. A direct JSX spread is compiler-managed; it is not equivalent to eagerly copying those props into an intermediate object.

The benefit is that unrelated component setup need not run for every update. The cost is that timing and placement of reads matter. Translating syntax without checking those reads can produce a component that works initially and stops following updates.

React JSX creates an element description. Solid JSX can create a rendered value when evaluated. A deferred callback or getter lets the Solid runtime evaluate that work later, under the appropriate context and cleanup scope. The port must preserve this timing instead of trying to retrofit props onto an already-created DOM node.

## Rendering, step by step

Sources: [React system](packages/ariakit-react-utils/src/system.tsx) and [Solid system](packages/ariakit-solid-utils/src/system.tsx).

Both helpers are named `createElement`. They are Ariakit helpers, not aliases for React's or Solid's framework APIs. They choose the underlying element, forward props, and apply a wrapper.

### 1. Separate rendering options from forwarded props

React uses object rest:

```ts
const { wrapElement, render, ...rest } = props;
```

Solid uses a live filtered view:

```ts
const rest = omit(props, "render", "wrapElement");
```

Both remove Ariakit's rendering options from the props passed to the underlying element. Forwarding them to a native element would expose internal options as DOM attributes.

Solid's `omit` preserves access to the original props, including reactive getters. It avoids an eager object copy at component setup. It can use proxy machinery internally; this is reuse of Solid's primitive, not a claim that the port has eliminated proxies.

The previous port used `splitProps` to create an options view and a remaining-props view. That also preserved reactive reads. The current helper only needs the remaining-props view because it reads options directly from `props`.

**Tradeoff:** filtering is concise, but it does not compose props or apply defaults. Those are separate responsibilities.

### 2. Choose the underlying renderer

React has three branches:

1. A React element: merge its props with Ariakit props and clone it.
2. A render callback: call it with the forwarded props.
3. No custom renderer: render the default element or component.

Solid currently implements the last two through its native `dynamic` helper:

```tsx
const Render = dynamic(() => props.render ?? Type);
const renderElement = () => <Render {...rest} />;
```

`Type` is the default element or component. The selector reads `props.render` reactively, so changing the renderer can replace the rendered subtree. `renderElement` delays creation until its caller requests it.

For example, this is supported today:

```tsx
createElement("button", {
  children: "Save",
  render: (props) => <button {...props} type="button" />,
});
```

The callback receives forwarded children, attributes, events, and refs. It controls how those props reach its returned element. Neither the React callback branch nor the current Solid callback branch automatically merges additional props written inside the callback.

**Tradeoff:** native `dynamic` owns selection and rendering rather than Ariakit maintaining that runtime machinery. Changing the renderer can dispose the old subtree and create another one; it is not a guarantee that future component hooks refresh assumptions made during initial setup. React's `Options` documentation already calls out components that detect their element type when mounted. Those components need their own parity tests when ported.

### 3. Create the subtree inside its wrapper

React creates an element description and passes it to `wrapElement`:

```tsx
wrapElement: (element) => (
  <Context.Provider value="Wrapped">{element}</Context.Provider>
);
```

Constructing that description does not execute its child components. They can run later under the returned provider.

Solid passes a factory instead:

```tsx
wrapElement: (element) => <Context value="Wrapped">{element()}</Context>;
```

Calling `element()` inside the provider lets the subtree read that provider's context. Creating it before the provider would be too early. The reactive owner is the scope that supplies context and associates computations with cleanup; wrapper placement therefore affects more than the eventual DOM nesting.

The helper selects the wrapper reactively:

```tsx
const Element = dynamic(() => {
  const wrapElement = props.wrapElement;
  return wrapElement ? () => wrapElement(renderElement) : renderElement;
});
return <Element />;
```

There are two selections: the inner one chooses the renderer, and the outer one chooses whether rendering happens through a wrapper. Returning a component function from the outer selector defers wrapper execution to the rendering runtime.

**Tradeoff:** the factory preserves creation timing, but wrapper authors must call it at the intended location. The argument differs from React's element argument. Wrapping and changes to wrapper identity need behavioral tests; the current shared suite checks provider context across hiding and remounting, not every possible wrapper replacement.

The old port already deferred rendering and accumulated wrappers in a `wrapInstance` array. The current callback is a smaller starting contract, not proof that wrapper accumulation was unnecessary. Composed component hooks still need a way to combine their wrappers in the correct order.

### 4. Support the element-form equivalent

**Required, not implemented.** React can inspect a supplied element's type, props, and ref before cloning it. An already-created Solid DOM node is not an equivalent element description.

The previous port used `As` to provide deferred recipes with element-like syntax:

```tsx
// Previous port syntax; As is not implemented on this branch.
<Role render={<As.button type="button" />} />
<Role render={<As component={MyButton} />} />
```

`As` returned a function awaiting Ariakit props, then merged those props with its own props before creating the element. A proxy generated and cached the intrinsic-element helpers. A type assertion represented that function as a JSX element.

The useful capability is deferred creation plus element-prop composition. That capability remains required alongside render callbacks. The precise Solid 2 representation is still open: the old implementation is evidence and prior art, not a requirement to copy its proxy or type assertions.

**Tradeoff to resolve:** keep convenient element syntax without losing reactive props, wrapper ownership, ref composition, or accurate types. Tests must cover both forms, not silently substitute callbacks for element-form cases.

## Prop types

Sources: [React types](packages/ariakit-react-utils/src/types.ts) and [Solid types](packages/ariakit-solid-utils/src/types.ts).

| Solid export    | Meaning                                                                   | React comparison and current limit                                                                                                  |
| --------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `HTMLProps<T>`  | Props accepted by the default element/component, plus `data-*` attributes | Uses Solid's `ComponentProps<T>` instead of React's `ComponentPropsWithRef<T>`. Custom-option key exclusion is not implemented yet. |
| `RenderProp<T>` | Callback receiving those forwarded props and returning Solid JSX          | React's callback returns `ReactNode`; this callback returns Solid's `JSX.Element`. It is not yet an element-or-callback union.      |
| `WrapElement`   | Callback receiving a factory for the rendered subtree                     | React receives an element description; Solid receives `() => JSX.Element` to defer creation.                                        |
| `Options<T>`    | Internal `render` and `wrapElement` options                               | Currently only these rendering options; element-form support remains missing.                                                       |
| `Props<T>`      | `HTMLProps<T>` combined with rendering options                            | React's `Props<T, P>` also models custom component options. That richer composition is pending.                                     |

The generic `T` connects the default renderer to its forwarded props. This helps check attributes and refs without an untyped props bag. It does not yet provide a complete polymorphic component API or infer every substituted component's additional props.

**Tradeoff:** the current types describe the small implemented helper precisely, but cannot serve as the final component-hook types. Extending them must preserve useful inference and handle collisions between custom options and element props.

## Composition that still needs implementation

These are gaps, not reasons to simplify away React behavior.

### Prop overrides, handlers, styles, and refs

React's element branch calls [mergeProps](packages/ariakit-react-utils/src/misc.ts) and merges Ariakit's ref with the supplied element's ref using [useMergeRefs](packages/ariakit-react-utils/src/hooks.ts).

The current React merge rules include combining class names, merging style objects with override properties winning, ignoring ordinary overrides whose value is `undefined`, and running an override event handler before the base handler. Non-function handler overrides preserve the base handler. The merged handler itself runs both functions; individual component handlers can inspect `defaultPrevented`.

React's [forwardRef helper](packages/ariakit-react-utils/src/system.tsx) separately removes props holding `undefined` before calling the component implementation. That boundary behavior is different from a live DOM attribute becoming `undefined`, which can remove the attribute. The Solid native-attribute test proves the latter, not the former.

Solid currently forwards a ref and handlers, but does not merge multiple refs or compose overrides. A generic reactive merge primitive is insufficient unless it reproduces Ariakit's rules. For example, replacing an internal click handler with a consumer handler could remove keyboard or accessibility behavior.

**Tradeoff to resolve:** preserve these precedence rules while keeping props live. A plain object copy is easy to read but can freeze Solid values; custom proxies can preserve reads but need careful property-presence, removal, and typing behavior. No final mechanism has been selected.

### Hooks and component inheritance

React's `createHook` accepts props and returns props. Components extend one another by calling these hooks and layering behavior. The rendering system consumes the final result.

The old Solid port had `createHook` and `withOptions`. The latter split component options from forwarded props and applied defaults. Neither helper has been rebuilt. React's destructuring and spread patterns cannot simply be copied if they capture values that should remain reactive.

**Tradeoff to resolve:** keep the dependency graph and behavior easy to compare with React, while making each Solid read occur at the right time. Do not create a different interaction model just because a different abstraction is easier to implement.

### Stores, context, and lifecycle

The Solid store package has no adapter yet. React's system also includes `createStoreContext`, with normal and scoped contexts and provider composition. There is no Solid equivalent on this branch.

The adapter will need to preserve shared Ariakit state semantics, subscriptions, controlled state, derived values, and disposal. Solid's own store API is not automatically a replacement for `@ariakit/store`.

React effects and Solid computations are not interchangeable by name. For each future translation, identify what triggers it, when it runs relative to rendering and DOM work, and what gets cleaned up. Solid 2's scheduling and split-effect model make this a behavior question, not a mechanical rename. See the [Solid 2 migration guide](https://v2.solidjs.com/migration/from-solid-1).

**Tradeoff to resolve:** use Solid's native ownership and lifecycle without changing observable store, focus, or event behavior. DOM event delegation and ordering also need verification where they affect components. No specific compatibility workaround is established yet.

## Shared behavior tests

The test structure separates behavior from framework setup:

| File                                                                    | Responsibility                                         |
| ----------------------------------------------------------------------- | ------------------------------------------------------ |
| [Shared assertions](packages/ariakit-test/src/__system-tests.ts)        | Queries, user actions, and expected observable results |
| [React adapter](packages/ariakit-react-utils/src/system.react.test.tsx) | React state, refs, context, and mounting               |
| [Solid adapter](packages/ariakit-solid-utils/src/system.solid.test.tsx) | Solid signals, refs, context, and mounting/disposal    |

The shared helper imports no React or Solid implementation. It receives a mount function and runs the same scenarios against each adapter. It is private test infrastructure, not a public `@ariakit/test` export or part of the Solid runtime.

The Solid fixtures use signals for local state and getters when passing changing values through a manually constructed props object:

```tsx
createElement("div", {
  get children() {
    return count();
  },
});
```

Writing `children: count()` there would read the value while constructing the object. The getter lets the renderer read it inside reactive work. The wrapper fixture also uses a getter for child JSX so that a context-reading child is created under the wrapper, not before it. React's fixture can pass a child element description directly.

The current scenarios check renderer replacement, live children and attribute removal without replacing the node, event/ref forwarding, and provider context across remounting. They deliberately check behavior rather than the internal shape of Solid's reactive graph.

**Benefit:** a regression in either implementation fails the same expectation. **Cost:** each framework still needs a fixture that represents the same interaction. Shared assertions do not help if one fixture quietly avoids the difficult case.

The Solid suite opts into jsdom. During implementation, happy-dom dropped numeric `0` when Solid's native renderer assigned it to `textContent`. A minimal native-renderer probe reproduced this independently of the Ariakit helper. The environment override keeps that case testable without adding a production workaround. Revisit the override when the emulator behavior changes.

A server-rendering smoke check was performed during development, but it is not a committed SSR/hydration test suite. Browser event ordering, hydration, ref composition, and element-form rendering still need their own coverage as those pieces arrive.

Run the focused suites from the repository root:

```sh
pnpm test system.react.test.tsx system.solid.test.tsx --run
```

## Compiler, dependencies, and builds

Solid's compiler decides how JSX becomes reactive rendering work. Testing with the wrong compiler or runtime can validate behavior that consumers will not get.

| Configuration                                                                                            | Current choice                                                                           | Reason and limitation                                                                                                                                   |
| -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Root and Solid library development dependencies                                                          | `solid-js` and `@solidjs/web` at `2.0.0-rc.13` where used                                | Exercise matching core and web runtimes rather than a mixed Solid 1/2 setup. These are release candidates.                                              |
| Solid utility peer dependencies                                                                          | Both packages at `^2.0.0-rc.13`                                                          | Consumers supply compatible runtimes. Other Solid manifests declare peers according to their current imports.                                           |
| [Solid TypeScript configuration](tsconfig.solid.json) and [test configuration](tsconfig.solid.test.json) | `jsxImportSource: "@solidjs/web"`                                                        | Solid 2's web JSX types and runtime come from the web package.                                                                                          |
| [Library builder](packages/ariakit-scripts/src/build.ts) and [Vitest](vitest.config.ts)                  | `@solidjs/vite-plugin` at `3.0.0-next.47`                                                | Compile Solid 2 JSX consistently. Published DOM output uses `generate: "dom"`; the builder also retains its JSX source output for consumer compilation. |
| [Framework fixture loader](vitest.setup.framework.ts)                                                    | `createComponent` and `Loading` from `solid-js`; `render` from `@solidjs/web`            | Mount Solid 2 fixtures under a loading boundary and dispose them after tests. This loader is separate from the self-mounting system tests.              |
| [Workspace installation policy](pnpm-workspace.yaml)                                                     | Version-specific release-age exceptions for the selected Solid runtime/compiler packages | Permit installation of the selected prereleases and their platform compiler packages without broad exemptions.                                          |

Solid 2 separates the web runtime and introduces the new compiler integration. See its [release announcement](https://github.com/solidjs/solid/discussions/2995) for upstream rationale; the repository manifests are the source of truth for versions used here.

The Astro app and legacy website retain their own Solid 1 dependencies and integrations. Updating the root test and library toolchain does not migrate those preview environments. A passing legacy website build does not prove that a new Solid 2 example works there.

**Tradeoff:** the library can progress against Solid 2 while preview migration is separate, but contributors must check which runtime an example actually uses. SSR and hydration remain port requirements; the current DOM build alone is not evidence that they work.

Package builds rewrite export metadata and generated output. Run package builds separately from tests and type checks, then clean before returning to source-mode work:

```sh
pnpm -F @ariakit/solid-utils run build
pnpm clean
pnpm tsc
pnpm test system.react.test.tsx system.solid.test.tsx --run
pnpm lint-fix
```

Use the repository-declared pnpm and Node versions, as described in [Contributing](contributing.md#installing-dependencies). The bootstrap command is `pnpm install`. Work targeting the Solid integration branch does not add changesets at this stage.

## Developing the next pieces

Start with the corresponding React source, its dependencies, and the behavior its tests establish. Foundations and basic components can progress in parallel where the component's prerequisites exist. A dependency map helps select that work; it does not decide whether the result is complete.

For each translation:

1. Identify the props, state transitions, DOM effects, event ordering, and cleanup the React implementation relies on.
2. Preserve shared framework-independent logic and the component inheritance relationships.
3. Choose Solid primitives that preserve those behaviors, accounting for reactive reads and ownership.
4. Extend shared scenarios for the supported behavior and any discovered regression. Use real-browser checks when emulators cannot establish the result.
5. Explain any necessary deviation beside the relevant code and in this guide, with its evidence and remaining limits.

SSR/hydration, Solid 2 compatibility, and correct reactive lifecycle are requirements throughout the implementation, not isolated features to finish once. Do not claim them from a source-file match or a single smoke check.

## Keeping this guide useful

Every new implementation piece should add or update its explanation here in the same PR. Explain the React counterpart, the observable behavior, the Solid implementation, why the framework difference requires it, and the benefits, costs, alternatives, and tests. Link the source so readers can follow the explanation into code.

When a decision becomes settled, replace its pending discussion with the implemented reasoning and evidence. When a design changes, revise the explanation rather than accumulating contradictory historical notes. New components need their own entries describing any component-specific translation; repeating the entire foundation explanation is unnecessary.

The previous port remains useful historical reference. It does not constrain the new design, and missing capabilities must not be described as improvements merely because the new implementation is shorter.
