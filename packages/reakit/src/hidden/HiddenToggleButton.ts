import * as React from "react";
import forwardRef from "../_utils/forwardRef";
import { As, PropsWithAs } from "../_utils/types";
import useHiddenToggleButton, {
  UseHiddenToggleButtonOptions
} from "./useHiddenToggleButton";
import { useCreateElement } from "../utils";
import splitHiddenProps from "./splitHiddenProps";

export type HiddenToggleButtonProps<T extends As> = PropsWithAs<
  UseHiddenToggleButtonOptions,
  T
>;

export const HiddenToggleButton = forwardRef(
  <T extends As = "button">(
    { as = "button" as T, ...props }: HiddenToggleButtonProps<T>,
    ref: React.Ref<any>
  ) => {
    const [options, htmlProps] = splitHiddenProps(props);
    const buttonProps = useHiddenToggleButton(options, { ref, ...htmlProps });
    return useCreateElement(as, buttonProps);
  }
);

export default HiddenToggleButton;
