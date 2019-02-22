import * as React from "react";
import { As, PropsWithAs } from "../_utils/types";
import forwardRef from "../_utils/forwardRef";
import splitProps from "../utils/splitProps";
import useCreateElement from "../utils/useCreateElement";
import useStep, { UseStepOptions } from "./useStep";

export type StepProps<T extends As> = PropsWithAs<UseStepOptions, T>;

export const Step = forwardRef(
  <T extends As = "div">(
    { as = "div" as T, ...props }: StepProps<T>,
    ref: React.Ref<any>
  ) => {
    const [options, htmlProps] = splitProps(props, useStep.keys);
    const stepProps = useStep(options, { ref, ...htmlProps });
    return useCreateElement(as, stepProps);
  }
);

export default Step;
