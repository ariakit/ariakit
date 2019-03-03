import {
  useStepState,
  unstable_StepState,
  unstable_StepSelectors,
  unstable_StepActions,
  unstable_UseStepStateOptions
} from "../step/useStepState";
import { unstable_useId } from "../utils/useId";

export type unstable_TabState = unstable_StepState & {
  /** TODO: Description */
  baseId: string;
};

export type unstable_TabSelectors = unstable_StepSelectors;

export type unstable_TabActions = unstable_StepActions;

export type unstable_UseTabStateOptions = unstable_UseStepStateOptions;

// TODO: Accept function for the entire options or for each value
export function useTabState({
  loop = true,
  activeIndex = 0,
  ...options
}: unstable_UseTabStateOptions = {}): unstable_TabState &
  unstable_TabSelectors &
  unstable_TabActions {
  const baseId = unstable_useId("tab-");
  return {
    baseId,
    ...useStepState({ loop, activeIndex, ...options })
  };
}

const keys: Array<keyof ReturnType<typeof useTabState>> = [
  "baseId",
  ...useStepState.keys
];

useTabState.keys = keys;
