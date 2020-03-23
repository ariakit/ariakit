import {
  SealedInitialState,
  useSealedState
} from "reakit-utils/useSealedState";
import {
  unstable_useCompositeState as useCompositeState,
  unstable_CompositeState as CompositeState,
  unstable_CompositeActions as CompositeActions,
  unstable_CompositeInitialState as CompositeInitialState
} from "../Composite/CompositeState";

export type ToolbarState = CompositeState;

export type ToolbarActions = CompositeActions;

export type ToolbarInitialState = CompositeInitialState;

export type ToolbarStateReturn = ToolbarState & ToolbarActions;

export function useToolbarState(
  initialState: SealedInitialState<ToolbarInitialState> = {}
): ToolbarStateReturn {
  const { orientation = "horizontal", ...sealed } = useSealedState(
    initialState
  );
  return useCompositeState({ orientation, ...sealed });
}

const keys: Array<keyof ToolbarStateReturn> = [...useCompositeState.__keys];

useToolbarState.__keys = keys;
