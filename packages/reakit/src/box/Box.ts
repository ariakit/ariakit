import * as React from "react";
import { As, PropsWithAs } from "../_utils/types";
import forwardRef from "../_utils/forwardRef";
import { useCreateElement } from "../utils";
import useBox, { UseBoxOptions } from "./useBox";

export type BoxProps<T extends As> = PropsWithAs<UseBoxOptions, T>;

export const Box = forwardRef(
  <T extends As = "div">(
    { as = "div" as T, ...props }: BoxProps<T>,
    ref: React.Ref<any>
  ) => {
    const boxProps = useBox(props, { ref, ...props });
    return useCreateElement(as, boxProps);
  }
);

export default Box;
