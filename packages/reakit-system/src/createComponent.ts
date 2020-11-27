import * as React from "react";
import { As, PropsWithAs } from "reakit-utils/types";
import { splitProps } from "reakit-utils/splitProps";
import { shallowEqual } from "reakit-utils/shallowEqual";
import { isPlainObject, normalizePropsAreEqual } from "reakit-utils";
import { forwardRef } from "./__utils/forwardRef";
import { useCreateElement as defaultUseCreateElement } from "./useCreateElement";
import { memo } from "./__utils/memo";
import {
  StateContext,
  withStateContextSubscriber,
  StateContextListener,
  StateContextSubscribe,
} from "./withStateContextSubscriber";

type RoleHTMLProps = React.HTMLAttributes<any> &
  React.RefAttributes<any> & {
    wrapElement?: (element: React.ReactNode) => React.ReactNode;
  };

type Hook<O> = {
  (options?: O, props?: RoleHTMLProps): RoleHTMLProps;
  unstable_propsAreEqual?: (prev: O, next: O) => boolean;
  __keys?: ReadonlyArray<any>;
};

type Options<T extends As, O> = {
  as: T;
  useHook?: Hook<O>;
  keys?: ReadonlyArray<any>;
  memo?: boolean;
  context?: StateContext<O>;
  isContextProvider?: boolean;
  propsAreEqual?: (prev: O, next: O) => boolean;
  useCreateElement?: (
    type: T,
    props: Omit<PropsWithAs<O, T>, "as">,
    children?: React.ReactNode
  ) => JSX.Element;
};

export type Component<T extends As, O> = {
  <TT extends As>(props: PropsWithAs<O, TT> & { as: TT }): JSX.Element;
  (props: PropsWithAs<O, T>): JSX.Element;
  displayName?: string;
  unstable_propsAreEqual: (
    prev: PropsWithAs<O, T>,
    next: PropsWithAs<O, T>
  ) => boolean;
  __keys?: ReadonlyArray<any>;
};

/**
 * Creates a React component.
 *
 * @example
 * import { createComponent } from "reakit-system";
 *
 * const A = createComponent({ as: "a" });
 *
 * @param options
 */
export function createComponent<T extends As, O>({
  as: type,
  useHook,
  memo: shouldMemo,
  context,
  isContextProvider = false,
  propsAreEqual = useHook?.unstable_propsAreEqual,
  keys = useHook?.__keys || [],
  useCreateElement = defaultUseCreateElement,
}: Options<T, O>) {
  let Comp = ((
    { as = type, ...props }: PropsWithAs<O, T>,
    ref: React.Ref<T>
  ) => {
    const initialState = React.useRef<O>();

    if (useHook) {
      const [options, htmlProps] = splitProps(props, keys);
      if (!initialState.current) {
        initialState.current = options;
      }
      const { wrapElement, ...elementProps } = useHook(options, {
        ref,
        ...htmlProps,
      });
      // @ts-ignore
      const asKeys = as.render?.__keys || as.__keys;
      const asOptions = asKeys && splitProps(props, asKeys)[0];
      const allProps =
        // If `as` is a string, then that means it's an element not a component
        // we don't need to pass the state in this case.
        // If a component is passed, then the component can decide
        // what should happen with the state prop.
        isPlainObject(props.state) && typeof as !== "string"
          ? { state: props.state, ...elementProps }
          : asOptions
          ? { ...elementProps, ...asOptions }
          : elementProps;

      let element = useCreateElement(as, allProps as typeof props);
      if (context && isContextProvider) {
        if (isContextProvider) {
          const listenersRef = React.useRef(new Set<StateContextListener<O>>());

          const subscribe: StateContextSubscribe<O> = React.useCallback(
            (listener: StateContextListener<O>) => {
              listenersRef.current.add(listener);
              return () => listenersRef.current.delete(listener);
            },
            []
          );

          React.useEffect(() => {
            for (const listener of listenersRef.current) {
              listener(options);
            }
          }, [options]);

          const value = React.useMemo(
            () => ({ initialState: initialState.current as O, subscribe }),
            [initialState.current, subscribe]
          );

          element = React.createElement(context.Provider, { value }, element);
        }
      }

      if (wrapElement) {
        return wrapElement(element);
      }
      return element;
    }
    return useCreateElement(as, { ref, ...props });
  }) as Component<T, O>;

  if (process.env.NODE_ENV !== "production" && useHook) {
    Comp.displayName = useHook.name.replace(/^(unstable_)?use/, "");
  }

  Comp = forwardRef(Comp);

  if (context && !isContextProvider) {
    Comp = withStateContextSubscriber(Comp, context);
  }

  if (shouldMemo) {
    Comp = memo(Comp, propsAreEqual && normalizePropsAreEqual(propsAreEqual));
  }

  Comp.__keys = keys;

  Comp.unstable_propsAreEqual = normalizePropsAreEqual(
    propsAreEqual || shallowEqual
  );

  return Comp;
}
