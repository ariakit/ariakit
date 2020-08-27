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

export function unstable_useComboboxMenuState(
  initialState: SealedInitialState<unstable_ComboboxMenuInitialState> = {}
): unstable_ComboboxMenuStateReturn {
  const {
    currentId = null,
    orientation = "vertical",
    loop = true,
    ...sealed
  } = useSealedState(initialState);

  const composite = useCompositeState({
    currentId,
    orientation,
    loop,
    ...sealed,
    unstable_virtual: true,
  });

  return useComboboxBaseState(composite, sealed);
}

export type unstable_ComboboxMenuState = ComboboxBaseState<CompositeState>;

export type unstable_ComboboxMenuActions = ComboboxBaseActions<
  CompositeActions
>;

export type unstable_ComboboxMenuInitialState = Omit<
  CompositeInitialState,
  "unstable_virtual"
> &
  ComboboxBaseInitialState;

export type unstable_ComboboxMenuStateReturn = unstable_ComboboxMenuState &
  unstable_ComboboxMenuActions;
