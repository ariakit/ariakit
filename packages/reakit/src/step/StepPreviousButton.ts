import * as React from "react";
import { As, PropsWithAs } from "../_utils/types";
import forwardRef from "../_utils/forwardRef";
import { useCreateElement } from "../utils";
import splitStepProps from "./splitStepProps";
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
    const [options, htmlProps] = splitStepProps(props);
    const buttonProps = useStepPreviousButton(options, { ref, ...htmlProps });
    return useCreateElement(as, buttonProps);
  }
);

export default StepPreviousButton;
