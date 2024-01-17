import * as React from "react";
import type { AnyObject, EmptyObject } from "@ariakit/core/utils/types";
import { useMergeRefs } from "./hooks.js";
import { getRefProperty, mergeProps } from "./misc.js";
import type { Store } from "./store.js";
import type { HTMLProps, Hook, Options, Props } from "./types.js";

/**
 * The same as `React.forwardRef` but passes the `ref` as a prop and returns a
 * component with the same generic type.
 */
export function forwardRef<T extends React.FC<any>>(render: T) {
  const Role = React.forwardRef((props, ref) => render({ ...props, ref }));
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
 * @example
 * import { createElement } from "@ariakit/react-core/utils/system";
 *
 * function Component() {
 *   const props = {
 *     render: (htmlProps) => <button {...htmlProps} />,
 *     wrapElement: (element) => <div>{element}</div>,
 *   };
 *   return createElement(TagName, props);
 * }
 */
export function createElement(
  Type: React.ElementType,
  props: Props<React.ElementType, Options>,
) {
  const { wrapElement, render, ...rest } = props;
  const mergedRef = useMergeRefs(props.ref, getRefProperty(render));

  let element: React.ReactElement;

  if (React.isValidElement<any>(render)) {
    const renderProps = { ...render.props, ref: mergedRef };
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
