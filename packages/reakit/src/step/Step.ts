import * as React from "react";
import { As, PropsWithAs } from "../_utils/types";
import useStep, { UseStepOptions } from "./useStep";
import forwardRef from "../_utils/forwardRef";
import { useCreateElement } from "../utils";
import splitStepProps from "./splitStepProps";

export type StepProps<T extends As> = PropsWithAs<UseStepOptions, T>;

export const Step = forwardRef(
  <T extends As = "div">(
    { as = "div" as T, ...props }: StepProps<T>,
    ref: React.Ref<any>
  ) => {
    const [options, htmlProps] = splitStepProps(props);
    const stepProps = useStep(options, { ref, ...htmlProps });
    return useCreateElement(as, stepProps);
  }
);

export default Step;
