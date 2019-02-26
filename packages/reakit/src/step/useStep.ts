import * as React from "react";
import { unstable_useHook } from "../system/useHook";
import {
  useHidden,
  unstable_UseHiddenOptions,
  unstable_UseHiddenProps
} from "../hidden/useHidden";
import {
  useStepState,
  unstable_StepState,
  unstable_StepSelectors,
  unstable_StepActions
} from "./useStepState";

export type unstable_UseStepOptions = unstable_UseHiddenOptions &
  Partial<unstable_StepState & unstable_StepSelectors & unstable_StepActions> &
  Pick<unstable_StepSelectors, "isActive"> &
  Pick<unstable_StepActions, "register" | "unregister"> & {
    /** TODO: Description */
    stepId: string;
    /** TODO: Description */
    order?: number;
  };

export type unstable_UseStepProps = unstable_UseHiddenProps;

export function useStep(
  options: unstable_UseStepOptions,
  htmlProps: unstable_UseStepProps = {}
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

const keys: Array<keyof unstable_UseStepOptions> = [
  ...useHidden.keys,
  ...useStepState.keys,
  "stepId",
  "order"
];

useStep.keys = keys;
