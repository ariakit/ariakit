import * as React from "react";
import { SealedInitialState, useSealedState } from "../__utils/useSealedState";
import { unstable_useId } from "../utils/useId";
import { useRoverState, RoverState, RoverActions } from "../Rover/RoverState";
import { Keys } from "../__utils/types";

export type TabState = RoverState & {
  /**
   * TODO: Description
   * @private
   */
  unstable_baseId: string;
  /**
   * TODO: Description
   */
  selectedId: RoverState["currentId"];
  /**
   * TODO: Description
   */
  manual: boolean;
};

export type TabActions = RoverActions & {
  /**
   * TODO: Description
   */
  select: (id: TabState["selectedId"]) => void;
};

export type TabInitialState = Partial<TabState>;

export type TabStateReturn = TabState & TabActions;

export function useTabState(
  initialState: SealedInitialState<TabInitialState> = {}
): TabStateReturn {
  const {
    unstable_baseId: baseId = unstable_useId("tab-"),
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
