import {
  useStepState,
  unstable_StepState,
  unstable_StepSelectors,
  unstable_StepActions,
  unstable_StepStateOptions
} from "../Step/useStepState";
import { unstable_useId } from "../utils/useId";

export type unstable_TabState = unstable_StepState & {
  /** TODO: Description */
  baseId: string;
};

export type unstable_TabSelectors = unstable_StepSelectors;

export type unstable_TabActions = unstable_StepActions;

export type unstable_TabStateOptions = unstable_StepStateOptions;

export type unstable_TabStateReturn = unstable_TabState &
  unstable_TabSelectors &
  unstable_TabActions;

// TODO: Accept function for the entire options or for each value
export function useTabState({
  loop = true,
  activeIndex = 0,
  ...options
}: unstable_TabStateOptions = {}): unstable_TabStateReturn {
  const baseId = unstable_useId("tab-");
  return {
    ...useStepState({ loop, activeIndex, ...options }),
    baseId
  };
}

const keys: Array<keyof unstable_TabStateReturn> = [
  ...useStepState.keys,
  "baseId"
];

useTabState.keys = keys;
