import { unstable_useId } from "../utils/useId";
import {
  useRovingState,
  unstable_RovingState,
  unstable_RovingSelectors,
  unstable_RovingActions,
  unstable_RovingStateOptions
} from "../Roving/RovingState";

export type unstable_TabState = unstable_RovingState & {
  /** TODO: Description */
  baseId: string;
};

export type unstable_TabSelectors = unstable_RovingSelectors;

export type unstable_TabActions = unstable_RovingActions;

export type unstable_TabStateOptions = unstable_RovingStateOptions;

export type unstable_TabStateReturn = unstable_TabState &
  unstable_TabSelectors &
  unstable_TabActions;

// TODO: Accept function for the entire options or for each value
export function useTabState({
  loop = true,
  autoSelect = true,
  ...options
}: unstable_TabStateOptions = {}): unstable_TabStateReturn {
  const baseId = unstable_useId("tab-");
  return {
    ...useRovingState({ loop, autoSelect, ...options }),
    baseId
  };
}

const keys: Array<keyof unstable_TabStateReturn> = [
  ...useRovingState.keys,
  "baseId"
];

useTabState.keys = keys;
