/* eslint-disable */
import * as React from "react";
import useBoxProps, { UseBoxPropsOptions } from "./useBoxProps";
import { ComponentPropsWithAs, As } from "../_utils/types";
import { render } from "../utils";
import forwardRef from "../_utils/forwardRef";

export type BoxProps<T extends As> = UseBoxPropsOptions &
  ComponentPropsWithAs<T> & React.HTMLAttributes<any>;

export const Box = forwardRef(
  <T extends As = "div">(
    { as = "div" as T, theme, ...props }: BoxProps<T>,
    ref: React.Ref<any>
  ) => {
    props = { as, ref, ...props };
    props = useBoxProps({ theme }, props);
    return render(props);
  }
);

export default Box;
