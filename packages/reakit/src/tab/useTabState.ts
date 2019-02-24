import {
  useStepState,
  StepState,
  StepSelectors,
  StepActions,
  UseStepStateOptions
} from "../step/useStepState";
import { useId } from "../utils/_useId";

export type TabState = StepState & {
  /** TODO: Description */
  baseId: string;
};

export type TabSelectors = StepSelectors;

export type TabActions = StepActions;

export type UseTabStateOptions = UseStepStateOptions;

export function useTabState({
  loop = true,
  activeIndex = 0,
  ...options
}: UseTabStateOptions = {}): TabState & TabSelectors & TabActions {
  const baseId = useId("tab-");
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
