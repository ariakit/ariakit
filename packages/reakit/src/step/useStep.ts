import * as React from "react";
import { StepSelectors, StepActions } from "./useStepState";
import { useHidden, UseHiddenOptions, UseHiddenProps } from "../hidden";
import { useHook } from "../theme";

export type UseStepOptions = UseHiddenOptions &
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

export default useStep;
