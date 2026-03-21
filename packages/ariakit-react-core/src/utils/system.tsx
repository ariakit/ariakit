import type { AnyObject, EmptyObject } from "@ariakit/core/utils/types";
import * as React from "react";
import { useMergeRefs } from "./hooks.ts";
import { getRefProperty, mergeProps } from "./misc.ts";
import type { Store } from "./store.ts";
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

type InternalStoreProvider<T extends Store> = React.ComponentType<{
  value: T | undefined;
  children?: React.ReactNode;
  __ariakitContext?: StoreContextMetadata | undefined;
}>;

type StoreContextMode = "context" | "scoped" | "provider";

interface StoreContextMetadata<T extends Store = Store> {
  name: string;
  useContext: () => T | undefined;
  useScopedContext: (onlyScoped?: boolean) => T | undefined;
  useProviderContext: () => T | undefined;
  useContextSource: () => StoreContextMetadata | undefined;
  useScopedContextSource: (
    onlyScoped?: boolean,
  ) => StoreContextMetadata | undefined;
  useProviderContextSource: () => StoreContextMetadata | undefined;
}

const storeContextSymbol = Symbol("ariakitStoreContext");
const warnedStoreContexts = new Set<string>();

export type StoreContextComponent<T extends Store = Store> =
  React.ComponentType<any> & {
    [storeContextSymbol]?: StoreContextMetadata<T>;
  };

export type StoreProp<T extends Store = Store> = T | StoreContextComponent<T>;

function getStoreContextMetadata<T extends Store>(store?: StoreProp<T>) {
  if (typeof store !== "function") return;
  return store[storeContextSymbol];
}

function getStoreFromMetadata<T extends Store>(
  metadata: StoreContextMetadata,
  mode: StoreContextMode,
) {
  if (mode === "scoped") {
    return metadata.useScopedContext() as T | undefined;
  }
  if (mode === "provider") {
    return metadata.useProviderContext() as T | undefined;
  }
  return metadata.useContext() as T | undefined;
}

function getStoreSourceFromMetadata(
  metadata: StoreContextMetadata,
  mode: StoreContextMode,
) {
  if (mode === "scoped") {
    return metadata.useScopedContextSource();
  }
  if (mode === "provider") {
    return metadata.useProviderContextSource();
  }
  return metadata.useContextSource();
}

function useStoreContext<T extends Store>(
  store: StoreProp<T> | undefined,
  metadata: StoreContextMetadata<T>,
  componentName: string,
  mode: StoreContextMode,
) {
  const providerMetadata = getStoreContextMetadata(store);
  const explicitStore = providerMetadata
    ? getStoreFromMetadata<T>(providerMetadata, mode)
    : (store as T | undefined);
  const implicitStore = getStoreFromMetadata<T>(metadata, mode);
  const implicitSource = getStoreSourceFromMetadata(metadata, mode);
  const resolvedStore = explicitStore || implicitStore;
  const shouldWarn =
    !store &&
    !!resolvedStore &&
    !!implicitSource &&
    implicitSource !== metadata &&
    !!implicitSource.name;

  React.useEffect(() => {
    if (!shouldWarn) return;
    if (process.env.NODE_ENV === "production") return;
    const providerName = implicitSource.name;
    const key = `${componentName}:${providerName}`;
    if (warnedStoreContexts.has(key)) return;
    warnedStoreContexts.add(key);
    console.warn(
      `${componentName} is reading its store from ${providerName} implicitly. ` +
        "This is deprecated and will stop working in a future version. " +
        `Pass \`store={${providerName}}\` to keep the current behavior.`,
    );
  }, [componentName, implicitSource, shouldWarn]);

  return resolvedStore;
}

/**
 * Creates an Ariakit store context with hooks and provider components.
 */
export function createStoreContext<T extends Store>(
  providers: StoreProvider<any>[] = [],
  scopedProviders: StoreProvider<any>[] = [],
  name = "Provider",
) {
  const context = React.createContext<T | undefined>(undefined);
  const scopedContext = React.createContext<T | undefined>(undefined);
  const contextSource = React.createContext<StoreContextMetadata | undefined>(
    undefined,
  );
  const scopedContextSource = React.createContext<
    StoreContextMetadata | undefined
  >(undefined);

  const useContext = () => React.useContext(context);
  const useContextSource = () => React.useContext(contextSource);

  const useScopedContext = (onlyScoped = false) => {
    const scoped = React.useContext(scopedContext);
    const store = useContext();
    if (onlyScoped) return scoped;
    return scoped || store;
  };

  const useScopedContextSource = (onlyScoped = false) => {
    const scoped = React.useContext(scopedContext);
    const scopedSource = React.useContext(scopedContextSource);
    const source = useContextSource();
    if (onlyScoped) return scopedSource;
    return scoped ? scopedSource : source;
  };

  const useProviderContext = () => {
    const scoped = React.useContext(scopedContext);
    const store = useContext();
    if (scoped && scoped === store) return;
    return store;
  };

  const useProviderContextSource = () => {
    const scoped = React.useContext(scopedContext);
    const store = useContext();
    const source = useContextSource();
    if (scoped && scoped === store) return;
    return source;
  };

  const metadata: StoreContextMetadata<T> = {
    name,
    useContext,
    useScopedContext,
    useProviderContext,
    useContextSource,
    useScopedContextSource,
    useProviderContextSource,
  };

  const ContextProviderImpl = (
    props: React.ComponentPropsWithoutRef<typeof context.Provider> & {
      __ariakitContext?: StoreContextMetadata | undefined;
    },
  ) => {
    const { __ariakitContext = metadata, ...providerProps } = props;
    return providers.reduceRight(
      (children, Provider) => {
        const InternalProvider = Provider as InternalStoreProvider<T>;
        return (
          <InternalProvider
            {...providerProps}
            __ariakitContext={__ariakitContext}
          >
            {children}
          </InternalProvider>
        );
      },
      <contextSource.Provider value={__ariakitContext}>
        <context.Provider {...providerProps} />
      </contextSource.Provider>,
    );
  };

  const ScopedContextProviderImpl = (
    props: React.ComponentPropsWithoutRef<typeof scopedContext.Provider> & {
      __ariakitContext?: StoreContextMetadata | undefined;
    },
  ) => {
    const { __ariakitContext = metadata, ...providerProps } = props;
    return (
      <ContextProviderImpl
        {...providerProps}
        __ariakitContext={__ariakitContext}
      >
        {scopedProviders.reduceRight(
          (children, Provider) => {
            const InternalProvider = Provider as InternalStoreProvider<T>;
            return (
              <InternalProvider
                {...providerProps}
                __ariakitContext={__ariakitContext}
              >
                {children}
              </InternalProvider>
            );
          },
          <scopedContextSource.Provider value={__ariakitContext}>
            <scopedContext.Provider {...providerProps} />
          </scopedContextSource.Provider>,
        )}
      </ContextProviderImpl>
    );
  };

  const ContextProvider = ContextProviderImpl as StoreProvider<T>;

  const ScopedContextProvider = ScopedContextProviderImpl as StoreProvider<T>;

  const registerProvider = (component: StoreContextComponent<T>) => {
    component[storeContextSymbol] = metadata;
  };

  const useContextStore = (
    store: StoreProp<T> | undefined,
    componentName: string,
  ) => {
    return useStoreContext(store, metadata, componentName, "context");
  };

  const useScopedContextStore = (
    store: StoreProp<T> | undefined,
    componentName: string,
  ) => {
    return useStoreContext(store, metadata, componentName, "scoped");
  };

  const useProviderContextStore = (
    store: StoreProp<T> | undefined,
    componentName: string,
  ) => {
    return useStoreContext(store, metadata, componentName, "provider");
  };

  return {
    context,
    scopedContext,
    useContext,
    useContextSource,
    useScopedContext,
    useScopedContextSource,
    useProviderContext,
    useProviderContextSource,
    useContextStore,
    useScopedContextStore,
    useProviderContextStore,
    ContextProvider,
    ScopedContextProvider,
    registerProvider,
  };
}
