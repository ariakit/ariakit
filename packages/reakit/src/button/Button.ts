import * as React from "react";
import { As, PropsWithAs } from "../_utils/types";
import forwardRef from "../_utils/forwardRef";
import { useCreateElement } from "../utils";
import useButton, { UseButtonOptions } from "./useButton";

export type ButtonProps<T extends As> = PropsWithAs<UseButtonOptions, T>;

export const Button = forwardRef(
  <T extends As = "button">(
    { as = "button" as T, ...props }: ButtonProps<T>,
    ref: React.Ref<any>
  ) => {
    const buttonProps = useButton(props, { ref, ...props });
    return useCreateElement(as, buttonProps);
  }
);

export default Button;
