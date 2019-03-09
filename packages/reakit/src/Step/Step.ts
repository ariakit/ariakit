import * as React from "react";
import { unstable_createComponent } from "../utils/createComponent";
import { unstable_useHook } from "../system/useHook";
import {
  useHidden,
  unstable_HiddenOptions,
  unstable_HiddenProps
} from "../Hidden/Hidden";
import { useStepState, unstable_StepStateReturn } from "./useStepState";

export type unstable_StepOptions = unstable_HiddenOptions &
  Partial<unstable_StepStateReturn> &
  Pick<unstable_StepStateReturn, "isActive" | "register" | "unregister"> & {
    /** TODO: Description */
    stepId: string;
    /** TODO: Description */
    order?: number;
  };

export type unstable_StepProps = unstable_HiddenProps;

export function useStep(
  options: unstable_StepOptions,
  htmlProps: unstable_StepProps = {}
) {
  React.useEffect(() => {
    options.register(options.stepId, options.order);
    return () => options.unregister(options.stepId);
  }, [options.register, options.unregister, options.stepId, options.order]);

  htmlProps = useHidden(
    { visible: options.isActive(options.stepId), ...options },
    htmlProps
  );
  htmlProps = unstable_useHook("useStep", options, htmlProps);
  return htmlProps;
}

const keys: Array<keyof unstable_StepOptions> = [
  ...useHidden.keys,
  ...useStepState.keys,
  "stepId",
  "order"
];

useStep.keys = keys;

export const Step = unstable_createComponent("div", useStep);
