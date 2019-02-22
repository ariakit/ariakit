import * as React from "react";
import forwardRef from "../_utils/forwardRef";
import { As, PropsWithAs } from "../_utils/types";
import useCreateElement from "../utils/useCreateElement";
import splitProps from "../utils/splitProps";
import useHiddenToggleButton, {
  UseHiddenToggleButtonOptions
} from "./useHiddenToggleButton";

export type HiddenToggleButtonProps<T extends As> = PropsWithAs<
  UseHiddenToggleButtonOptions,
  T
>;

export const HiddenToggleButton = forwardRef(
  <T extends As = "button">(
    { as = "button" as T, ...props }: HiddenToggleButtonProps<T>,
    ref: React.Ref<any>
  ) => {
    const [options, htmlProps] = splitProps(props, useHiddenToggleButton.keys);
    const buttonProps = useHiddenToggleButton(options, { ref, ...htmlProps });
    return useCreateElement(as, buttonProps);
  }
);

export default HiddenToggleButton;
