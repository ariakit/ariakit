import {
  SealedInitialState,
  useSealedState,
} from "reakit-utils/useSealedState";
import {
  PopoverState,
  PopoverActions,
  PopoverInitialState,
  usePopoverState,
} from "../Popover/PopoverState";
import {
  unstable_useComboboxGridState as useComboboxGridState,
  unstable_ComboboxGridState as ComboboxGridState,
  unstable_ComboboxGridActions as ComboboxGridActions,
  unstable_ComboboxGridInitialState as ComboboxGridInitialState,
} from "./ComboboxGridState";

export type unstable_ComboboxGridPopoverState = ComboboxGridState &
  PopoverState;

export type unstable_ComboboxGridPopoverActions = ComboboxGridActions &
  PopoverActions;

export type unstable_ComboboxGridPopoverInitialState = ComboboxGridInitialState &
  PopoverInitialState;

export type unstable_ComboboxGridPopoverStateReturn = unstable_ComboboxGridPopoverState &
  unstable_ComboboxGridPopoverActions;

export function unstable_useComboboxGridPopoverState(
  initialState: SealedInitialState<
    unstable_ComboboxGridPopoverInitialState
  > = {}
): unstable_ComboboxGridPopoverStateReturn {
  const { gutter = 0, ...sealed } = useSealedState(initialState);
  const combobox = useComboboxGridState(sealed);
  const popover = usePopoverState({ gutter, ...sealed });
  return {
    ...combobox,
    ...popover,
    matches: combobox.visible ? combobox.matches : [],
  };
}
