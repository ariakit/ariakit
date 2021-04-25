import { InitialState } from "reakit-utils/types";
import { useInitialValue } from "reakit-utils/hooks";
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

export function unstable_useComboboxListState(
  initialState: InitialState<unstable_ComboboxListInitialState> = {}
): unstable_ComboboxListStateReturn {
  const {
    currentId = null,
    orientation = "vertical",
    loop = true,
    ...sealed
  } = useInitialValue(initialState);

  const composite = useCompositeState({
    currentId,
    orientation,
    loop,
    ...sealed,
    unstable_virtual: true,
    unstable_includesBaseElement: true,
  });

  return useComboboxBaseState(composite, sealed);
}

export type unstable_ComboboxListState = ComboboxBaseState<CompositeState>;

export type unstable_ComboboxListActions = ComboboxBaseActions<CompositeActions>;

export type unstable_ComboboxListInitialState = Omit<
  CompositeInitialState,
  "unstable_virtual" | "unstable_includesBaseElement"
> &
  ComboboxBaseInitialState;

export type unstable_ComboboxListStateReturn = unstable_ComboboxListState &
  unstable_ComboboxListActions;
