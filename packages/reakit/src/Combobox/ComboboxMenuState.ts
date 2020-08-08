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
import {
  ComboboxBaseState,
  ComboboxBaseActions,
  ComboboxBaseInitialState,
  useComboboxBaseState,
} from "./__utils/ComboboxBaseState";

export type unstable_ComboboxMenuState = CompositeState & ComboboxBaseState;

export type unstable_ComboboxMenuActions = CompositeActions &
  ComboboxBaseActions;

export type unstable_ComboboxMenuInitialState = Omit<
  CompositeInitialState,
  "unstable_virtual"
> &
  ComboboxBaseInitialState;

export type unstable_ComboboxMenuStateReturn = unstable_ComboboxMenuState &
  unstable_ComboboxMenuActions;

export function unstable_useComboboxMenuState(
  initialState: SealedInitialState<unstable_ComboboxMenuInitialState> = {}
): unstable_ComboboxMenuStateReturn {
  const {
    currentId = null,
    orientation = "vertical",
    ...sealed
  } = useSealedState(initialState);

  const composite = useCompositeState({
    currentId,
    orientation,
    ...sealed,
    unstable_virtual: true,
  });

  const combobox = useComboboxBaseState(composite, sealed);

  return {
    ...combobox,
    menuRole: "listbox",
  };
}
