/**
 * Helpers for creating and composing Ariakit Solid components.
 * @module System utilities
 */

import type { Store } from "@ariakit/store";
import type { AnyObject, EmptyObject } from "@ariakit/utils";
import type {
  Accessor,
  Component,
  ComponentProps,
  JSX,
  ValidComponent,
} from "solid-js";
import {
  createMemo,
  mergeProps,
  splitProps,
  createContext as solidCreateContext,
  useContext as solidUseContext,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import type {
  ExtractPropsWithDefaultsExtractedProps,
  ExtractPropsWithDefaultsRestProps,
} from "./reactivity.ts";
import { extractPropsWithDefaults } from "./reactivity.ts";
import type {
  Hook,
  HTMLProps,
  Options,
  Props,
  WrapInstance,
  WrapInstanceValue,
} from "./types.ts";

/**
 * Creates a Solid component instance that supports the `render` and
 * `wrapInstance` props.
 */
export function createInstance(
  Component: ValidComponent,
  props: Props<ValidComponent, Options>,
) {
  // TODO: consider adding a dev-only runtime check to clarify that
  // the JSX.Element type is only accepted through `As`, so that
  // the error is not a vague "value is not a function" error.
  const [features, rest] = splitProps(
    props as typeof props & { _metadataProps?: unknown },
    ["render", "wrapInstance", "_metadataProps"],
  );
  // Internal metadata props (see `createMetadataProps`) must reach a composed
  // component so they keep propagating down the tree, but must not be spread
  // onto a host element, where they would leak as a DOM attribute.
  const withRender = () => (
    // TODO: replace with LazyDynamic
    <Dynamic
      {...mergeProps(rest, {
        get _metadataProps() {
          const component = (features.render as ValidComponent) ?? Component;
          return typeof component === "function"
            ? features._metadataProps
            : undefined;
        },
      })}
      component={(features.render as ValidComponent) ?? Component}
    />
  );
  let tree = withRender;
  if (features.wrapInstance) {
    for (const element of features.wrapInstance) {
      const children = tree;
      tree = () => (
        // TODO: replace with LazyDynamic
        <Dynamic component={element as ValidComponent}>{children()}</Dynamic>
      );
    }
  }
  return tree();
}

/**
 * Returns props with an additional `wrapInstance` prop.
 */
export function wrapInstance<
  P,
  // oxlint-disable-next-line no-unnecessary-type-parameters
  Q = P & { wrapInstance: WrapInstance },
>(props: P & { wrapInstance?: WrapInstance }, element: WrapInstanceValue): Q {
  const wrapInstance = [...(props.wrapInstance ?? []), element];
  return mergeProps(props, { wrapInstance }) as Q;
}

/**
 * Creates a component hook that accepts props and returns props so they can be
 * passed to a Solid component.
 */
export function createHook<
  T extends ValidComponent,
  P extends AnyObject = EmptyObject,
>(useProps: (props: Props<T, P>) => HTMLProps<T, P>) {
  return useProps as Hook<T, P>;
}

/**
 * Splits "option props" from the rest in a component hook. Must be called
 * inside `createHook`.
 *
 * The first argument is an object that defines the props that will be extracted,
 * with their default values. To extract a prop without a default, set it to
 * `undefined`.
 *
 * The hook function must be passed as the second argument, and it will receive
 * the rest of the props and the extracted options.
 * @example
 * ```jsx
 * export const useMyComponent = createHook<TagName, MyComponentOptions>(
 *   withOptions(
 *     { orientation: "horizontal" },
 *     function useMyComponent(props, options) {
 *       // ...
 *     },
 *   ),
 * );
 * ```
 */
export function withOptions<
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
): (props: ComputedP) => HTMLProps<T, P> {
  return function usePropsWithOptions(props: ComputedP) {
    const [options, rest] = extractPropsWithDefaults(props, defaults);
    return useProps(rest, options);
  };
}

/**
 * Passes metadata props around the component tree without leaking them to the
 * DOM. The metadata is carried on the internal `_metadataProps` prop, which
 * `createInstance` strips before rendering a host element. A plain (non-`on*`)
 * prop is used on purpose: `mergeProps`/`combineProps` would chain an `on*`
 * carrier into a wrapper function and drop the attached symbols during
 * composition, whereas a plain prop survives the merge with its symbols intact.
 * Returns a reactive accessor for the parent value and the props that forward
 * the augmented metadata to descendants.
 * @example
 * ```jsx
 * const symbol = Symbol("command");
 * function useCommand(props) {
 *   const [isDuplicate, metadataProps] = createMetadataProps(props, symbol, () => true);
 *   props = mergeProps(props, metadataProps);
 *   // isDuplicate() is true when a parent already set the symbol.
 * }
 * ```
 */
export function createMetadataProps<T, K extends keyof any>(
  props: { _metadataProps?: { [key in K]?: T } },
  key: K,
  value: () => T,
) {
  const parent = () => props._metadataProps as { [P in K]?: T } | undefined;
  const carrier = createMemo(() =>
    Object.assign(
      {},
      parent(),
      value() !== undefined ? { [key]: value() } : undefined,
    ),
  );
  return [
    () => parent()?.[key],
    {
      get _metadataProps() {
        return carrier();
      },
    },
  ] as const;
}

type StoreProvider<T extends Store> = Component<{
  value: Accessor<T | undefined>;
  children?: JSX.Element;
}>;

type RenderFn = () => JSX.Element;

/**
 * Creates an Ariakit store context with hooks and provider components. Unlike
 * the React equivalent, the context value is an `Accessor<T>` rather than the
 * store object itself, because Ariakit Solid stores are accessors.
 */
export function createStoreContext<T extends Store>(
  providers: StoreProvider<T>[] = [],
  scopedProviders: StoreProvider<T>[] = [],
) {
  const context = solidCreateContext<Accessor<T | undefined>>(() => undefined);
  const scopedContext = solidCreateContext<Accessor<T | undefined>>(
    () => undefined,
  );

  const useContext = () => solidUseContext(context);

  const useScopedContext = (onlyScoped = false) => {
    const scoped = solidUseContext(scopedContext);
    const store = useContext();
    if (onlyScoped) return scoped;
    return () => scoped() || store();
  };

  const useProviderContext = () => {
    const scoped = solidUseContext(scopedContext);
    const store = useContext();
    return () => {
      const $scoped = scoped();
      const $store = store();
      if ($scoped && $scoped === $store) return;
      return $store;
    };
  };

  const ContextProvider = (props: ComponentProps<typeof context.Provider>) => {
    return providers.reduceRight<RenderFn>(
      (children, Provider) => () => (
        <Provider {...props}>{children()}</Provider>
      ),
      () => <context.Provider {...props} />,
    )();
  };

  const ScopedContextProvider = (
    props: ComponentProps<typeof scopedContext.Provider>,
  ) => {
    return (
      <ContextProvider {...props}>
        {scopedProviders.reduceRight<RenderFn>(
          (children, Provider) => () => (
            <Provider {...props}>{children()}</Provider>
          ),
          () => <scopedContext.Provider {...props} />,
        )()}
      </ContextProvider>
    );
  };

  return {
    context,
    scopedContext,
    useContext,
    useScopedContext,
    useProviderContext,
    ContextProvider,
    ScopedContextProvider,
  };
}
