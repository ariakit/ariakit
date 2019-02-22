import * as React from "react";
import { As, PropsWithAs } from "../_utils/types";
import forwardRef from "../_utils/forwardRef";
import splitProps from "../utils/splitProps";
import useCreateElement from "../utils/useCreateElement";
import useStepNextButton, {
  UseStepNextButtonOptions
} from "./useStepNextButton";

export type StepNextButtonProps<T extends As> = PropsWithAs<
  UseStepNextButtonOptions,
  T
>;

export const StepNextButton = forwardRef(
  <T extends As = "button">(
    { as = "button" as T, ...props }: StepNextButtonProps<T>,
    ref: React.Ref<any>
  ) => {
    const [options, htmlProps] = splitProps(props, useStepNextButton.keys);
    const buttonProps = useStepNextButton(options, { ref, ...htmlProps });
    return useCreateElement(as, buttonProps);
  }
);

export default StepNextButton;
