import {
  SealedInitialState,
  useSealedState,
} from "reakit-utils/useSealedState";
import {
  unstable_ComboboxMenuState as ComboboxMenuState,
  unstable_ComboboxMenuActions as ComboboxMenuActions,
  unstable_ComboboxMenuInitialState as ComboboxMenuInitialState,
  unstable_useComboboxMenuState as useComboboxMenuState,
} from "./ComboboxMenuState";
import {
  ComboboxPopoverState,
  ComboboxPopoverActions,
  ComboboxPopoverInitialState,
  useComboboxPopoverState,
} from "./__utils/ComboboxPopoverState";

export type unstable_ComboboxState = ComboboxPopoverState & ComboboxMenuState;

export type unstable_ComboboxActions = ComboboxPopoverActions &
  ComboboxMenuActions;

export type unstable_ComboboxInitialState = ComboboxPopoverInitialState &
  ComboboxMenuInitialState;

export type unstable_ComboboxStateReturn = unstable_ComboboxState &
  unstable_ComboboxActions;

export function unstable_useComboboxState(
  initialState: SealedInitialState<unstable_ComboboxInitialState> = {}
): unstable_ComboboxStateReturn {
  const sealed = useSealedState(initialState);
  const combobox = useComboboxMenuState(sealed);
  return useComboboxPopoverState(combobox, sealed);
}
