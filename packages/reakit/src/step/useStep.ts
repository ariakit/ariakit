import * as React from "react";
import { useHook } from "../theme/useHook";
import {
  useHidden,
  UseHiddenOptions,
  UseHiddenProps
} from "../hidden/useHidden";
import {
  useStepState,
  StepState,
  StepSelectors,
  StepActions
} from "./useStepState";

export type UseStepOptions = UseHiddenOptions &
  Partial<StepState & StepSelectors & StepActions> &
  Pick<StepSelectors, "isActive"> &
  Pick<StepActions, "register" | "unregister"> & {
    /** TODO: Description */
    stepId: string;
    /** TODO: Description */
    order?: number;
  };

export type UseStepProps = UseHiddenProps;

export function useStep(options: UseStepOptions, props: UseStepProps) {
  React.useEffect(() => {
    options.register(options.stepId, options.order);
    return () => options.unregister(options.stepId);
  }, [options.register, options.unregister, options.stepId, options.order]);

  props = useHidden(
    { visible: options.isActive(options.stepId), ...options },
    props
  );
  props = useHook("useStep", options, props);
  return props;
}

const keys: Array<keyof UseStepOptions> = [
  ...useHidden.keys,
  ...useStepState.keys,
  "stepId",
  "order"
];

useStep.keys = keys;
