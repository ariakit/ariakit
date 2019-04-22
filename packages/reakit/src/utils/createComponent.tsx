import * as React from "react";
import { forwardRef } from "../__utils/forwardRef";
import { As, PropsWithAs } from "../__utils/types";
import { splitProps } from "../__utils/splitProps";
import { BoxProps } from "../Box/Box";
import { unstable_useCreateElement as defaultUseCreateElement } from "./useCreateElement";

type Hook<O> = {
  (options?: O, props?: BoxProps): NonNullable<typeof props>;
  __keys?: any[];
};

type Options<T extends As, O> = {
  as: T;
  useHook?: Hook<O>;
  keys?: any[];
  useCreateElement?: typeof defaultUseCreateElement;
};

export function unstable_createComponent<T extends As, O>({
  as: type,
  useHook,
  keys = (useHook && useHook.__keys) || [],
  useCreateElement = defaultUseCreateElement
}: Options<T, O>) {
  const Comp = <TT extends As = T>(
    { as = (type as unknown) as TT, ...props }: PropsWithAs<O, TT>,
    ref: React.Ref<any>
  ) => {
    if (useHook) {
      const [options, htmlProps] = splitProps(props, keys);
      const { unstable_wrap, ...elementProps } = useHook(options, {
        ref,
        ...htmlProps
      });
      // @ts-ignore
      const asKeys = as.render ? as.render.__keys : as.__keys;
      const asOptions = asKeys ? splitProps(props, asKeys)[0] : {};
      const element = useCreateElement(as, { ...elementProps, ...asOptions });
      if (unstable_wrap) {
        return unstable_wrap(element);
      }
      return element;
    }
    return useCreateElement(as, props);
  };

  (Comp as any).__keys = keys;

  if (process.env.NODE_ENV !== "production" && useHook) {
    (Comp as any).displayName = useHook.name.replace(/^(unstable_)?use/, "");
  }

  return forwardRef(Comp);
}
