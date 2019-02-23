import {
  useStepState,
  StepState,
  StepSelectors,
  StepActions,
  UseStepStateOptions
} from "../step/useStepState";

export type TabState = StepState;
export type TabSelectors = StepSelectors;
export type TabActions = StepActions;

export type UseTabStateOptions = UseStepStateOptions;

export function useTabState({
  loop = true,
  activeIndex = 0,
  ...options
}: UseTabStateOptions = {}): TabState & TabSelectors & TabActions {
  return useStepState({ loop, activeIndex, ...options });
}

useTabState.keys = useStepState.keys;
