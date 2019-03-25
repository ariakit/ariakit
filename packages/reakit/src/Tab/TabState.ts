import * as React from "react";
import { SealedInitialState, useSealedState } from "../__utils/useSealedState";
import { unstable_useId } from "../utils/useId";
import {
  useRoverState,
  unstable_RoverState,
  unstable_RoverActions
} from "../Rover/RoverState";
import { Keys } from "../__utils/types";

export type unstable_TabState = unstable_RoverState & {
  /** TODO: Description */
  unstable_baseId: string;
  /** TODO: Description */
  unstable_selectedId: unstable_RoverState["unstable_currentId"];
  /** TODO: Description */
  unstable_manual: boolean;
};

export type unstable_TabActions = unstable_RoverActions & {
  unstable_select: (id: unstable_TabState["unstable_selectedId"]) => void;
};

export type unstable_TabInitialState = Partial<unstable_TabState>;

export type unstable_TabStateReturn = unstable_TabState & unstable_TabActions;

export function useTabState(
  initialState: SealedInitialState<unstable_TabInitialState> = {}
): unstable_TabStateReturn {
  const {
    unstable_baseId: baseId = unstable_useId("tab-"),
    unstable_selectedId: sealedSelectedId = null,
    unstable_loop: loop = true,
    unstable_manual: manual = false
  } = useSealedState(initialState);

  const [selectedId, select] = React.useState(sealedSelectedId);
  const rover = useRoverState({
    unstable_loop: loop,
    unstable_currentId: selectedId
  });

  return {
    ...rover,
    unstable_baseId: baseId,
    unstable_selectedId: selectedId,
    unstable_manual: manual,
    unstable_select: select
  };
}

const keys: Keys<unstable_TabStateReturn> = [
  ...useRoverState.__keys,
  "unstable_baseId",
  "unstable_selectedId",
  "unstable_select",
  "unstable_manual"
];

useTabState.__keys = keys;
