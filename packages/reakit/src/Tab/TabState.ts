import * as React from "react";
import { unstable_useId } from "../utils/useId";
import {
  useRoverState,
  unstable_RoverState,
  unstable_RoverActions,
  unstable_RoverSelectors
} from "../Rover/RoverState";

export type unstable_TabState = unstable_RoverState & {
  /** TODO: Description */
  baseId: string;
  /** TODO: Description */
  selectedRef: any;
  /** TODO: Description */
  autoSelect: boolean;
};

export type unstable_TabSelectors = unstable_RoverSelectors;

export type unstable_TabActions = unstable_RoverActions & {
  select: (ref?: any) => void;
};

export type unstable_TabInitialState = Partial<unstable_TabState>;

export type unstable_TabStateReturn = unstable_TabState &
  unstable_TabSelectors &
  unstable_TabActions;

// TODO: Accept function for the entire initialState or for each value
export function useTabState({
  loop = true,
  selectedRef: initialSelectedRef = null,
  autoSelect = true,
  ...initialState
}: unstable_TabInitialState = {}): unstable_TabStateReturn {
  const baseId = unstable_useId("tab-");
  const [selectedRef, select] = React.useState(initialSelectedRef);
  const rover = useRoverState({ loop, activeRef: selectedRef });

  return {
    ...rover,
    baseId: initialState.baseId || baseId,
    selectedRef,
    autoSelect,
    select
  };
}

const keys: Array<keyof unstable_TabStateReturn> = [
  ...useRoverState.keys,
  "baseId",
  "selectedRef",
  "autoSelect",
  "select"
];

useTabState.keys = keys;
