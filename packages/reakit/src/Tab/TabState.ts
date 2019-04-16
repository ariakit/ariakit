import * as React from "react";
import {
  unstable_SealedInitialState,
  unstable_useSealedState
} from "../utils/useSealedState";
import { unstable_useId } from "../utils/useId";
import { useRoverState, RoverState, RoverActions } from "../Rover/RoverState";
import { Keys } from "../__utils/types";

export type TabState = RoverState & {
  /**
   * An ID that will serve as a base for the tab elements.
   * @private
   */
  unstable_baseId: string;
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
  initialState: unstable_SealedInitialState<TabInitialState> = {}
): TabStateReturn {
  const {
    unstable_baseId: baseId = unstable_useId("tab-"),
    selectedId: sealedSelectedId = null,
    loop = true,
    manual = false,
    ...sealed
  } = unstable_useSealedState(initialState);

  const [selectedId, select] = React.useState(sealedSelectedId);
  const rover = useRoverState({
    loop,
    currentId: selectedId,
    ...sealed
  });

  return {
    ...rover,
    unstable_baseId: baseId,
    selectedId,
    manual,
    select
  };
}

const keys: Keys<TabStateReturn> = [
  ...useRoverState.__keys,
  "unstable_baseId",
  "selectedId",
  "select",
  "manual"
];

useTabState.__keys = keys;
