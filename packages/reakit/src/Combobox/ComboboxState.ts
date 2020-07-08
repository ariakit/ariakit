import {
  SealedInitialState,
  useSealedState,
} from "reakit-utils/useSealedState";
import {
  useCompositeState,
  CompositeState,
  CompositeActions,
  CompositeInitialState,
} from "../Composite/CompositeState";

export type unstable_ComboboxState = CompositeState;

export type unstable_ComboboxActions = CompositeActions;

export type unstable_ComboboxInitialState = CompositeInitialState;

export type unstable_ComboboxStateReturn = unstable_ComboboxState &
  unstable_ComboboxActions;

export function unstable_useComboboxState(
  initialState: SealedInitialState<unstable_ComboboxInitialState> = {}
): unstable_ComboboxStateReturn {
  const sealed = useSealedState(initialState);
  return useCompositeState(sealed);
}
