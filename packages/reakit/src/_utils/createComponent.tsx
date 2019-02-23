import * as React from "react";
import { useCreateElement } from "../utils/useCreateElement";
import { splitProps } from "../utils/splitProps";
import { forwardRef } from "./forwardRef";
import { As, PropsWithAs } from "./types";

type Hook<Options> = {
  (
    options: Options,
    props: React.HTMLAttributes<any> & React.RefAttributes<any>
  ): typeof props;
  keys: any[];
};

export function createComponent<T extends As, O>(element: T, useHook: Hook<O>) {
  return forwardRef(
    <TT extends As = T>(
      { as = (element as unknown) as TT, ...props }: PropsWithAs<O, TT>,
      ref: React.Ref<any>
    ) => {
      const [options, htmlProps] = splitProps(props, useHook.keys);
      const elementProps = useHook(options, { ref, ...htmlProps });
      return useCreateElement(as, elementProps);
    }
  );
}
