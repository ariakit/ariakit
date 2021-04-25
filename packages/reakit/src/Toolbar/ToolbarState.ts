import { InitialState } from "reakit-utils/types";
import { useInitialValue } from "reakit-utils/hooks";
import {
  useCompositeState,
  CompositeState,
  CompositeActions,
  CompositeInitialState,
} from "../Composite/CompositeState";

export type ToolbarState = CompositeState;

export type ToolbarActions = CompositeActions;

export type ToolbarInitialState = CompositeInitialState;

export type ToolbarStateReturn = ToolbarState & ToolbarActions;

export function useToolbarState(
  initialState: InitialState<ToolbarInitialState> = {}
): ToolbarStateReturn {
  const { orientation = "horizontal", ...sealed } = useInitialValue(
    initialState
  );
  return useCompositeState({ orientation, ...sealed });
}
