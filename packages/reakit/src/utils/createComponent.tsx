import * as React from "react";

import { forwardRef } from "../__utils/forwardRef";
import { As, PropsWithAs } from "../__utils/types";

import { unstable_splitProps } from "./splitProps";
import { unstable_useCreateElement as originalUseCreateElement } from "./useCreateElement";

type Hook<Options> = {
  (
    options: Options,
    props: React.HTMLAttributes<any> & React.RefAttributes<any>
  ): typeof props;
  keys: any[];
};

export function unstable_createComponent<T extends As, O>(
  element: T,
  useHook: Hook<O>,
  useCreateElement = originalUseCreateElement
) {
  const Comp = <TT extends As = T>(
    { as = (element as unknown) as TT, ...props }: PropsWithAs<O, TT>,
    ref: React.Ref<any>
  ) => {
    const [options, htmlProps] = unstable_splitProps(props, useHook.keys);
    const elementProps = useHook(options, { ref, ...htmlProps });
    return useCreateElement(as, elementProps);
  };

  if (process.env.NODE_ENV !== "production") {
    (Comp as any).displayName = useHook.name.replace("use", "");
  }

  return forwardRef(Comp);
}
