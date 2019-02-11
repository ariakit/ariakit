/* eslint-disable */
import * as React from "react";
import useBoxProps, { UseBoxOptions } from "./useBoxProps";
import { ComponentPropsWithAs, As } from "../_utils/types";
import { render } from "../utils";
import forwardRef from "../_utils/forwardRef";
import mergeProps from "../utils/mergeProps";

export type BoxProps<T extends React.ReactType> = UseBoxOptions &
  ComponentPropsWithAs<T> & React.HTMLAttributes<any>;

export const Box = forwardRef(
  <T extends As = "div">(
    { as = "div" as T, theme, ...props }: BoxProps<T>,
    ref: React.Ref<any>
  ) => {
    const boxProps = useBoxProps({ theme });
    return render(mergeProps({ as, ref }, boxProps, props));
  }
);

export default Box;
