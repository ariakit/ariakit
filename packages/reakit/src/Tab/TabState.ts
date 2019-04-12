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
  unstable_selectedId: RoverState["unstable_currentId"];
  /**
   * TODO: Description
   */
  unstable_manual: boolean;
};

export type TabActions = RoverActions & {
  /**
   * TODO: Description
   */
  unstable_select: (id: TabState["unstable_selectedId"]) => void;
};

export type TabInitialState = Partial<TabState>;

export type TabStateReturn = TabState & TabActions;

export function useTabState(
  initialState: SealedInitialState<TabInitialState> = {}
): TabStateReturn {
  const {
    unstable_baseId: baseId = unstable_useId("tab-"),
    unstable_selectedId: sealedSelectedId = null,
    unstable_loop: loop = true,
    unstable_manual: manual = false,
    ...sealed
  } = useSealedState(initialState);

  const [selectedId, select] = React.useState(sealedSelectedId);
  const rover = useRoverState({
    unstable_loop: loop,
    unstable_currentId: selectedId,
    ...sealed
  });

  return {
    ...rover,
    unstable_baseId: baseId,
    unstable_selectedId: selectedId,
    unstable_manual: manual,
    unstable_select: select
  };
}

const keys: Keys<TabStateReturn> = [
  ...useRoverState.__keys,
  "unstable_baseId",
  "unstable_selectedId",
  "unstable_select",
  "unstable_manual"
];

useTabState.__keys = keys;
