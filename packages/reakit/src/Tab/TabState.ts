import * as React from "react";
import { SealedInitialState, useSealedState } from "../__utils/useSealedState";
import { unstable_useId } from "../utils/useId";
import {
  useRoverState,
  unstable_RoverState,
  unstable_RoverActions
} from "../Rover/RoverState";

export type unstable_TabState = unstable_RoverState & {
  /** TODO: Description */
  baseId: string;
  /** TODO: Description */
  selectedId: unstable_RoverState["currentId"];
  /** TODO: Description */
  manual: boolean;
};

export type unstable_TabActions = unstable_RoverActions & {
  select: (id: unstable_TabState["selectedId"]) => void;
};

export type unstable_TabInitialState = Partial<unstable_TabState>;

export type unstable_TabStateReturn = unstable_TabState & unstable_TabActions;

export function useTabState(
  initialState: SealedInitialState<unstable_TabInitialState> = {}
): unstable_TabStateReturn {
  const {
    baseId = unstable_useId("tab-"),
    selectedId: sealedSelectedId = null,
    loop = true,
    manual = false
  } = useSealedState(initialState);

  const [selectedId, select] = React.useState(sealedSelectedId);
  const rover = useRoverState({ loop, currentId: selectedId });

  return {
    ...rover,
    baseId,
    selectedId,
    manual,
    select
  };
}

const keys: Array<keyof unstable_TabStateReturn> = [
  ...useRoverState.keys,
  "baseId",
  "selectedId",
  "select",
  "manual"
];

useTabState.keys = keys;
