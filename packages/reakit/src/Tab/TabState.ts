import * as React from "react";
import {
  SealedInitialState,
  useSealedState
} from "reakit-utils/useSealedState";
import { useRoverState, RoverState, RoverActions } from "../Rover/RoverState";

export type TabState = RoverState & {
  /**
   * The current selected tab's `stopId`.
   */
  selectedId: RoverState["currentId"];
  /**
   * Whether the tab selection should be manual.
   */
  manual: boolean;
};

export type TabActions = RoverActions & {
  /**
   * Selects a tab by its `stopId`.
   */
  select: (id: TabState["selectedId"]) => void;
};

export type TabInitialState = Partial<TabState>;

export type TabStateReturn = TabState & TabActions;

export function useTabState(
  initialState: SealedInitialState<TabInitialState> = {}
): TabStateReturn {
  const {
    selectedId: sealedSelectedId = null,
    loop = true,
    manual = false,
    ...sealed
  } = useSealedState(initialState);

  const [selectedId, select] = React.useState(sealedSelectedId);
  const rover = useRoverState({
    loop,
    currentId: selectedId,
    ...sealed
  });

  return {
    ...rover,
    selectedId,
    manual,
    select
  };
}

const keys: Array<keyof TabStateReturn> = [
  ...useRoverState.__keys,
  "selectedId",
  "select",
  "manual"
];

useTabState.__keys = keys;
