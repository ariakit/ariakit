import * as React from "react";
import { As, PropsWithAs } from "../_utils/types";
import forwardRef from "../_utils/forwardRef";
import splitProps from "../utils/splitProps";
import useCreateElement from "../utils/useCreateElement";
import useStepPreviousButton, {
  UseStepPreviousButtonOptions
} from "./useStepPreviousButton";

export type StepPreviousButtonProps<T extends As> = PropsWithAs<
  UseStepPreviousButtonOptions,
  T
>;

export const StepPreviousButton = forwardRef(
  <T extends As = "button">(
    { as = "button" as T, ...props }: StepPreviousButtonProps<T>,
    ref: React.Ref<any>
  ) => {
    const [options, htmlProps] = splitProps(props, useStepPreviousButton.keys);
    const buttonProps = useStepPreviousButton(options, { ref, ...htmlProps });
    return useCreateElement(as, buttonProps);
  }
);

export default StepPreviousButton;
