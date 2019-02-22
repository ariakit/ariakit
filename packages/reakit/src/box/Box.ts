import * as React from "react";
import { As, PropsWithAs } from "../_utils/types";
import forwardRef from "../_utils/forwardRef";
import useCreateElement from "../utils/useCreateElement";
import splitProps from "../utils/splitProps";
import useBox, { UseBoxOptions } from "./useBox";

export type BoxProps<T extends As> = PropsWithAs<UseBoxOptions, T>;

export const Box = forwardRef(
  <T extends As = "div">(
    { as = "div" as T, ...props }: BoxProps<T>,
    ref: React.Ref<any>
  ) => {
    const [options, htmlProps] = splitProps(props, useBox.keys);
    const boxProps = useBox(options, { ref, ...htmlProps });
    return useCreateElement(as, boxProps);
  }
);

export default Box;
