import { Omit } from "../_utils/types";
import { splitHiddenProps } from "../hidden";
import { StepState, StepSelectors, StepActions } from "./useStepState";
import { UseStepOptions } from "./useStep";

export function splitStepProps<
  P extends Partial<
    StepState &
      StepSelectors &
      Omit<StepActions, "show" | "toggle"> &
      UseStepOptions
  >,
  K extends keyof P = never
>(props: P, keys: K[] = []) {
  return splitHiddenProps(props, [
    "loop",
    "ids",
    "activeIndex",
    "ordered",
    "getActiveId",
    "hasPrevious",
    "hasNext",
    "indexOf",
    "isActive",
    "hide",
    "previous",
    "next",
    "reorder",
    "register",
    "unregister",
    "stepId",
    "order",
    ...keys
  ]);
}

export default splitStepProps;
