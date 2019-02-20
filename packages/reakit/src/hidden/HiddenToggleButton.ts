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
    { as = "button" as T, ...props }: HiddenToggleButtonProps<T>,
    ref: React.Ref<any>
  ) => {
    // @ts-ignore TS bug - props have toggle
    const button = useHiddenToggleButton(props, { ref, ...props });
    return useCreateElement(as, button);
  }
);

export default HiddenToggleButton;
