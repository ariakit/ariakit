/**
 * Helpers for creating and composing Ariakit React components.
 * @module System utilities
 */

import type { Store } from "@ariakit/store";
import type { AnyFunction, AnyObject, EmptyObject } from "@ariakit/utils";
import * as React from "react";
import { useMergeRefs } from "./hooks.ts";
import { getRefProperty, mergeProps } from "./misc.ts";
import type { Hook, HTMLProps, Options, Props } from "./types.ts";

/**
 * The same as `React.forwardRef` but passes the `ref` as a prop and returns a
 * component with the same generic type.
 */
export function forwardRef<T extends React.FC<any>>(render: T) {
  const Role = React.forwardRef(
    // @ts-ignore Incompatible with React 19 types. Ignore for now.
    (props, ref) => render({ ...props, ref }),
  );
  Role.displayName = render.displayName || render.name;
  return Role as unknown as T;
}

/**
 * The same as `React.memo` but returns a component with the same generic type.
 */
export function memo<T extends React.FC<any>>(
  Component: T,
  propsAreEqual?: (
    prevProps: Readonly<React.ComponentPropsWithoutRef<T>>,
    nextProps: Readonly<React.ComponentPropsWithoutRef<T>>,
  ) => boolean,
) {
  return React.memo(Component, propsAreEqual) as unknown as T;
}

/**
 * Creates a React element that supports the `render` and `wrapElement` props.
 */
export function createElement(
  Type: React.ElementType,
  props: Props<React.ElementType, Options>,
) {
  const { wrapElement, render, ...rest } = props;
  const mergedRef = useMergeRefs(props.ref, getRefProperty(render));

  let element: React.ReactElement;

  if (React.isValidElement<any>(render)) {
    const renderProps = {
      // @ts-ignore Incompatible with React 19 types. Ignore for now.
      ...render.props,
      ref: mergedRef,
    };
    element = React.cloneElement(render, mergeProps(rest, renderProps));
  } else if (render) {
    element = render(rest) as React.ReactElement;
  } else {
    element = <Type {...rest} />;
  }

  if (wrapElement) {
    return wrapElement(element);
  }

  return element;
}

/**
 * Creates a component hook that accepts props and returns props so they can be
 * passed to a React element.
 */
export function createHook<
  T extends React.ElementType,
  P extends AnyObject = EmptyObject,
>(useProps: (props: Props<T, P>) => HTMLProps<T, P>) {
  const useRole = (props: Props<T, P> = {} as Props<T, P>) => {
    return useProps(props);
  };
  useRole.displayName = useProps.name;
  return useRole as Hook<T, P>;
}

type StoreProvider<T extends Store> = React.ComponentType<{
  value: T | undefined;
  children?: React.ReactNode;
}>;

/**
 * Key used to brand provider components created by `createStoreContext` so
 * store props and `useStoreState` can resolve them to their store context.
 * `Symbol.for` is used so different copies of this module still recognize each
 * other's provider components.
 */
export const providerComponentSymbol: unique symbol = Symbol.for(
  "ariakit.provider-component",
);

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

interface ProviderComponentValue<
  T extends Store = Store,
> extends ProviderComponentBrand<T> {
  context: React.Context<T | undefined>;
}

/**
 * A provider component (for example, `ComboboxProvider`) that can be passed to
 * store props and [`useStoreState`](https://ariakit.com/reference/use-store-state)
 * in place of a store object. The store is then read from the closest context
 * of that provider's kind (set by that provider, an extending provider, or a
 * compatible container component), skipping less specific store contexts.
 */
export interface ProviderComponent<T extends Store = Store> {
  readonly [providerComponentSymbol]: ProviderComponentBrand<T>;
}

/**
 * Checks whether the value is a provider component created by
 * `createStoreContext` (for example, `ComboboxProvider`).
 */
export function isProviderComponent<T extends Store>(
  value: T | ProviderComponent<T> | null | undefined,
): value is ProviderComponent<T>;

export function isProviderComponent(value: unknown): value is ProviderComponent;

export function isProviderComponent(
  value: unknown,
): value is ProviderComponent {
  if (typeof value !== "function") return false;
  return providerComponentSymbol in value;
}

function getProviderComponentContext<T extends Store>(
  provider: ProviderComponent<T>,
) {
  // The brand slot is always created by createStoreContext with the context
  // attached, so it can be safely narrowed to its full runtime shape.
  const value = provider[providerComponentSymbol] as ProviderComponentValue<T>;
  return value.context;
}

const emptyStoreContext = React.createContext<Store | undefined>(undefined);

/**
 * Resolves the value of a `store` prop that may receive either a store object
 * or a provider component. When a provider component is passed, it's an
 * explicit reference to that provider's context kind: the store is read only
 * from the closest context of that kind (set by that provider, an extending
 * provider, or a compatible container component), without falling back to the
 * given fallback stores, so it may be `undefined` if no such context value is
 * found. Otherwise, the store prop itself is returned, falling back to the
 * given fallback stores (typically the component's own context) when it's not
 * provided.
 *
 * The store type is inferred only from the store object arm of the `store`
 * prop; the provider component arm and the fallback stores are loosely typed
 * so they never widen or poison that inference. This matters for generic
 * options (for example, renderers), whose provider arm is branded with the
 * base store type.
 */
export function useStoreProp<T extends Store>(
  store: T | ProviderComponent | null | undefined,
  ...fallbacks: Array<Store | null | undefined>
): T | undefined;

export function useStoreProp(
  store: Store | ProviderComponent | null | undefined,
  ...fallbacks: Array<Store | null | undefined>
): Store | undefined {
  const isProvider = isProviderComponent(store);
  // Hooks must be called unconditionally, so always read a context: the
  // provider component's own context when the store is a provider component, or
  // an always empty context otherwise (its value is always undefined).
  const providerContext = isProvider
    ? getProviderComponentContext(store)
    : emptyStoreContext;
  const contextStore = React.useContext(providerContext);
  if (isProvider) return contextStore;
  if (store) return store;
  for (const fallback of fallbacks) {
    if (fallback) return fallback;
  }
  return;
}

/**
 * Creates an Ariakit store context with hooks and provider components.
 */
export function createStoreContext<T extends Store>(
  providers: StoreProvider<T>[] = [],
  scopedProviders: StoreProvider<T>[] = [],
) {
  const context = React.createContext<T | undefined>(undefined);
  const scopedContext = React.createContext<T | undefined>(undefined);

  const useContext = () => React.useContext(context);

  const useScopedContext = (onlyScoped = false) => {
    const scoped = React.useContext(scopedContext);
    const store = useContext();
    if (onlyScoped) return scoped;
    return scoped || store;
  };

  const useProviderContext = () => {
    const scoped = React.useContext(scopedContext);
    const store = useContext();
    if (scoped && scoped === store) return;
    return store;
  };

  const ContextProvider = (
    props: React.ComponentPropsWithoutRef<typeof context.Provider>,
  ) => {
    return providers.reduceRight(
      (children, Provider) => <Provider {...props}>{children}</Provider>,
      <context.Provider {...props} />,
    );
  };

  const ScopedContextProvider = (
    props: React.ComponentPropsWithoutRef<typeof scopedContext.Provider>,
  ) => {
    return (
      <ContextProvider {...props}>
        {scopedProviders.reduceRight(
          (children, Provider) => (
            <Provider {...props}>{children}</Provider>
          ),
          <scopedContext.Provider {...props} />,
        )}
      </ContextProvider>
    );
  };

  const createProviderComponent = <C extends AnyFunction>(
    component: C,
  ): C & ProviderComponent<T> => {
    const value: ProviderComponentValue<T> = { context };
    return Object.assign(component, { [providerComponentSymbol]: value });
  };

  return {
    context,
    scopedContext,
    useContext,
    useScopedContext,
    useProviderContext,
    ContextProvider,
    ScopedContextProvider,
    createProviderComponent,
  };
}
