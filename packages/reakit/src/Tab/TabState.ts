import * as React from "react";
import {
  SealedInitialState,
  useSealedState
} from "reakit-utils/useSealedState";
import { useId } from "reakit-utils/useId";
import { useRoverState, RoverState, RoverActions } from "../Rover/RoverState";

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
  initialState: SealedInitialState<TabInitialState> = {}
): TabStateReturn {
  const defaultId = useId("tab-");
  const {
    unstable_baseId: baseId = defaultId,
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

const keys: Array<keyof TabStateReturn> = [
  ...useRoverState.__keys,
  "unstable_baseId",
  "selectedId",
  "select",
  "manual"
];

useTabState.__keys = keys;
