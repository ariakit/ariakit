import * as React from "react";
import forwardRef from "../_utils/forwardRef";
import { As, PropsWithAs } from "../_utils/types";
import useHiddenToggleButton, {
  UseHiddenToggleButtonOptions
} from "./useHiddenToggleButton";
import { useCreateElement } from "../utils";

export type HiddenToggleButtonProps<T extends As> = PropsWithAs<
  UseHiddenToggleButtonOptions,
  T
>;

export const HiddenToggleButton = forwardRef(
  <T extends As = "button">(
    {
      as = "button" as T,
      theme,
      visible,
      show,
      hide,
      toggle,
      ...props
    }: HiddenToggleButtonProps<T>,
    ref: React.Ref<any>
  ) => {
    const button = useHiddenToggleButton({ theme, toggle }, { ref, ...props });
    return useCreateElement(as, button);
  }
);

export default HiddenToggleButton;
