import * as React from "react";
import { hasOwnProperty } from "@ariakit/core/utils/misc";
import type { AnyObject } from "@ariakit/core/utils/types";
import { useMergeRefs } from "./hooks.js";
import { getRefProperty, mergeProps } from "./misc.js";
import type { Store } from "./store.js";
import type {
  Component,
  HTMLProps,
  Hook,
  Options,
  Props,
  RenderProp,
} from "./types.js";

function isRenderProp(children: any): children is RenderProp {
  return typeof children === "function";
}

/**
 * The same as `React.forwardRef` but passes the `ref` as a prop and returns a
 * component with the same generic type.
 */
export function forwardRef<T extends React.FC>(render: T) {
  const Role = React.forwardRef<any>((props, ref) => render({ ...props, ref }));
  Role.displayName = render.displayName || render.name;
  return Role as unknown as T;
}

/**
 * The same as `React.memo` but returns a component with the same generic type.
 */
export function memo<P, T extends React.FC<P>>(
  Component: T,
  propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean,
) {
  const Role = React.memo(Component, propsAreEqual);
  Role.displayName = Component.displayName || Component.name;
  return Role as unknown as T;
}

/**
 * Creates a type-safe component with the `as` prop and `React.forwardRef`.
 *
 * @example
 * import { createComponent } from "@ariakit/react-core/utils/system";
 *
 * type Props = {
 *   as?: "div";
 *   customProp?: boolean;
 * };
 *
 * const Component = createComponent<Props>(({ customProp, ...props }) => {
 *   return <div {...props} />;
 * });
 *
 * <Component customProp render={<button />} />
 */
export function createComponent<O extends Options>(
  render: (props: Props<O>) => React.ReactElement,
) {
  const Role = (props: Props<O>, ref: React.Ref<any>) =>
    render({ ref, ...props });
  return React.forwardRef(Role) as unknown as Component<O>;
}

/**
 * Creates a type-safe component with the `as` prop, `React.forwardRef` and
 * `React.memo`.
 *
 * @example
 * import { createMemoComponent } from "@ariakit/react-core/utils/system";
 *
 * type Props = {
 *   as?: "div";
 *   customProp?: boolean;
 * };
 *
 * const Component = createMemoComponent<Props>(({ customProp, ...props }) => {
 *   return <div {...props} />;
 * });
 *
 * <Component customProp render={<button />} />
 */
export function createMemoComponent<O extends Options>(
  render: (props: Props<O>) => React.ReactElement,
) {
  const Role = createComponent(render);
  return React.memo(Role) as unknown as typeof Role;
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
 *   return createElement("div", props);
 * }
 */
export function createElement(
  Type: React.ElementType,
  props: HTMLProps<Options>,
) {
  const { as: As, wrapElement, render, ...rest } = props;
  let element: React.ReactElement;
  const mergedRef = useMergeRefs(props.ref, getRefProperty(render));

  if (process.env.NODE_ENV !== "production") {
    React.useEffect(() => {
      if (!As) return;
      console.warn(
        "The `as` prop is deprecated. Use the `render` prop instead.",
        "See https://ariakit.org/guide/composition",
      );
    }, [As]);
  }

  if (As && typeof As !== "string") {
    element = <As {...rest} render={render} />;
  } else if (React.isValidElement<AnyObject>(render)) {
    const renderProps: AnyObject = { ...render.props, ref: mergedRef };
    element = React.cloneElement(render, mergeProps(rest, renderProps));
  } else if (render) {
    // @ts-expect-error
    element = render(rest) as React.ReactElement;
  } else if (isRenderProp(props.children)) {
    if (process.env.NODE_ENV !== "production") {
      React.useEffect(() => {
        console.warn(
          "The `children` prop as a function is deprecated. Use the `render` prop instead.",
          "See https://ariakit.org/guide/composition",
        );
      }, []);
    }
    const { children, ...otherProps } = rest;
    element = props.children(otherProps) as React.ReactElement;
  } else if (As) {
    element = <As {...rest} />;
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
 *
 * @example
 * import { Options, createHook } from "@ariakit/react-core/utils/system";
 *
 * type Props = Options<"div"> & {
 *   customProp?: boolean;
 * };
 *
 * const useComponent = createHook<Props>(({ customProp, ...props }) => {
 *   return props;
 * });
 *
 * const props = useComponent({ as: "button", customProp: true });
 */
export function createHook<O extends Options>(
  useProps: (props: Props<O>) => HTMLProps<O>,
) {
  const useRole = (props: Props<O> = {} as Props<O>) => {
    const htmlProps = useProps(props);
    const copy = {} as typeof htmlProps;
    for (const prop in htmlProps) {
      if (hasOwnProperty(htmlProps, prop) && htmlProps[prop] !== undefined) {
        // @ts-expect-error
        copy[prop] = htmlProps[prop];
      }
    }
    return copy;
  };
  return useRole as Hook<O>;
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

  const useStoreContext = () => React.useContext(context);

  const useScopedStoreContext = () => {
    const scoped = React.useContext(scopedContext);
    const store = useStoreContext();
    return scoped || store;
  };

  const useStoreProviderContext = () => {
    const scoped = React.useContext(scopedContext);
    const store = useStoreContext();
    if (scoped && scoped === store) return;
    return store;
  };

  const StoreContextProvider = (
    props: React.ComponentPropsWithoutRef<typeof context.Provider>,
  ) => {
    return providers.reduceRight(
      (children, Provider) => <Provider {...props}>{children}</Provider>,
      <context.Provider {...props} />,
    );
  };

  const StoreScopedContextProvider = (
    props: React.ComponentPropsWithoutRef<typeof scopedContext.Provider>,
  ) => {
    return (
      <StoreContextProvider {...props}>
        {scopedProviders.reduceRight(
          (children, Provider) => (
            <Provider {...props}>{children}</Provider>
          ),
          <scopedContext.Provider {...props} />,
        )}
      </StoreContextProvider>
    );
  };

  return {
    context,
    scopedContext,
    useStoreContext,
    useScopedStoreContext,
    useStoreProviderContext,
    StoreContextProvider,
    StoreScopedContextProvider,
  };
}
