import {
  SealedInitialState,
  useSealedState,
} from "reakit-utils/useSealedState";
import {
  unstable_ComboboxMenuGridState as ComboboxMenuGridState,
  unstable_ComboboxMenuGridActions as ComboboxMenuGridActions,
  unstable_ComboboxMenuGridInitialState as ComboboxMenuGridInitialState,
  unstable_useComboboxMenuGridState as useComboboxMenuGridState,
} from "./ComboboxMenuGridState";
import {
  ComboboxPopoverState,
  ComboboxPopoverActions,
  ComboboxPopoverInitialState,
  useComboboxPopoverState,
} from "./__utils/ComboboxPopoverState";

export type unstable_ComboboxGridState = ComboboxPopoverState &
  ComboboxMenuGridState;

export type unstable_ComboboxGridActions = ComboboxPopoverActions &
  ComboboxMenuGridActions;

export type unstable_ComboboxGridInitialState = ComboboxPopoverInitialState &
  ComboboxMenuGridInitialState;

export type unstable_ComboboxGridStateReturn = unstable_ComboboxGridState &
  unstable_ComboboxGridActions;

export function unstable_useComboboxGridState(
  initialState: SealedInitialState<unstable_ComboboxGridInitialState> = {}
): unstable_ComboboxGridStateReturn {
  const sealed = useSealedState(initialState);
  const combobox = useComboboxMenuGridState(sealed);
  return useComboboxPopoverState(combobox, sealed);
}
