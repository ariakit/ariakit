// TODO: Refactor
import * as React from "react";
import { As, PropsWithAs } from "reakit-utils/types";
import { splitProps } from "reakit-utils/splitProps";
import { memo } from "./__utils/memo";
import { forwardRef } from "./__utils/forwardRef";
import { useCreateElement as defaultUseCreateElement } from "./useCreateElement";

type BoxHTMLProps = React.HTMLAttributes<any> &
  React.RefAttributes<any> & {
    wrapElement?: (element: React.ReactNode) => React.ReactNode;
  };

type Hook<O> = {
  (options?: O, props?: BoxHTMLProps): BoxHTMLProps;
  __keys?: ReadonlyArray<any>;
  __propsAreEqual?: (prev: O, next: O) => boolean;
};

type Options<T extends As, O> = {
  as: T;
  useHook?: Hook<O>;
  keys?: ReadonlyArray<any>;
  propsAreEqual?: (prev: O, next: O) => boolean;
  useCreateElement?: typeof defaultUseCreateElement;
};

export type Component<T extends As, O> = {
  // This is the desired type
  // <TT extends As = T>(props: PropsWithAs<O, TT>): JSX.Element;
  // Unfortunately, TypeScript doesn't like it. It works for string elements
  // and functional components without generics, but it breaks on generics.
  // See ./__tests__/createComponent-test.tsx
  // The following two types are a workaround.
  <TT extends As>(props: PropsWithAs<O, TT> & { as: TT }): JSX.Element;
  (props: PropsWithAs<O, T>): JSX.Element;
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
  keys = (useHook && useHook.__keys) || [],
  propsAreEqual = useHook && useHook.__propsAreEqual,
  useCreateElement = defaultUseCreateElement
}: Options<T, O>) {
  const Comp = (
    { as = type, ...props }: PropsWithAs<O, T>,
    ref: React.Ref<any>
  ) => {
    if (useHook) {
      const [options, htmlProps] = splitProps(props, keys);
      const { wrapElement, ...elementProps } = useHook(options, {
        ref,
        ...htmlProps
      });
      // @ts-ignore
      const asKeys = as.render ? as.render.__keys : as.__keys;
      const asOptions = asKeys ? splitProps(props, asKeys)[0] : {};
      const element = useCreateElement(as, { ...elementProps, ...asOptions });
      if (wrapElement) {
        return wrapElement(element);
      }
      return element;
    }
    return useCreateElement(as, props);
  };

  (Comp as any).__keys = keys;

  if (process.env.NODE_ENV !== "production" && useHook) {
    (Comp as any).displayName = useHook.name.replace(/^(unstable_)?use/, "");
  }

  return memo(forwardRef(Comp as Component<T, O>), propsAreEqual);
}
