import * as React from "react";
import { ComponentPropsWithAs, As } from "../_utils/types";
import forwardRef from "../_utils/forwardRef";
import { useCreateElement } from "../utils";
import useBoxProps, { BoxOptions } from "./useBoxProps";

export type BoxProps<T extends As> = BoxOptions & ComponentPropsWithAs<T>;

export const Box = forwardRef(
  <T extends As = "div">(
    { as = "div" as T, theme, ...props }: BoxProps<T>,
    ref: React.Ref<any>
  ) => {
    props = { as, ref, ...props };
    props = useBoxProps({ theme }, props) as typeof props;
    return useCreateElement(props);
  }
);

export default Box;
