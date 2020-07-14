import * as React from "react";
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
  unstable_useComboboxState as useComboboxState,
  unstable_ComboboxState as ComboboxState,
  unstable_ComboboxActions as ComboboxActions,
  unstable_ComboboxInitialState as ComboboxInitialState,
} from "./ComboboxState";

export type unstable_ComboboxPopoverState = ComboboxState & PopoverState;

export type unstable_ComboboxPopoverActions = ComboboxActions & PopoverActions;

export type unstable_ComboboxPopoverInitialState = ComboboxInitialState &
  PopoverInitialState;

export type unstable_ComboboxPopoverStateReturn = unstable_ComboboxPopoverState &
  unstable_ComboboxPopoverActions;

export function unstable_useComboboxPopoverState(
  initialState: SealedInitialState<unstable_ComboboxPopoverInitialState> = {}
): unstable_ComboboxPopoverStateReturn {
  const { gutter = 0, placement = "bottom-start", ...sealed } = useSealedState(
    initialState
  );
  const combobox = useComboboxState(sealed);
  const popover = usePopoverState({ gutter, placement, ...sealed });
  React.useEffect(() => {
    if (!popover.visible) {
      combobox.reset();
    }
  }, [popover.visible, combobox.reset]);
  return {
    ...combobox,
    ...popover,
    // It should work well even if matches aren't visible.
    // For people who want to render options statically
    // Maybe we can pass registerItem down only when options.visible
    matches: popover.visible ? combobox.matches : [],
  };
}
