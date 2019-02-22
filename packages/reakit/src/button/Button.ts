import * as React from "react";
import { As, PropsWithAs } from "../_utils/types";
import forwardRef from "../_utils/forwardRef";
import { useCreateElement } from "../utils";
import useButton, { UseButtonOptions } from "./useButton";
import splitButtonProps from "./splitButtonProps";

export type ButtonProps<T extends As> = PropsWithAs<UseButtonOptions, T>;

export const Button = forwardRef(
  <T extends As = "button">(
    { as = "button" as T, ...props }: ButtonProps<T>,
    ref: React.Ref<any>
  ) => {
    const [options, htmlProps] = splitButtonProps(props);
    const buttonProps = useButton(options, { ref, ...htmlProps });
    return useCreateElement(as, buttonProps);
  }
);

export default Button;
