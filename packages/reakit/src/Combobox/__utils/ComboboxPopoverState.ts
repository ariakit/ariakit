import * as React from "react";
import {
  PopoverState,
  PopoverActions,
  PopoverInitialState,
  usePopoverState,
} from "../../Popover/PopoverState";
import { unstable_ComboboxMenuStateReturn as ComboboxMenuStateReturn } from "../ComboboxMenuState";
import { unstable_ComboboxMenuGridStateReturn as ComboboxMenuGridStateReturn } from "../ComboboxMenuGridState";

export function useComboboxPopoverState<
  T extends ComboboxMenuStateReturn | ComboboxMenuGridStateReturn
>(
  combobox: T,
  {
    gutter = 0,
    placement = "bottom-start",
    ...initialState
  }: ComboboxPopoverInitialState = {}
) {
  const popover = usePopoverState({ gutter, placement, ...initialState });
  React.useEffect(() => {
    if (!popover.visible) {
      combobox.reset();
    }
  }, [popover.visible, combobox.reset]);
  return {
    ...combobox,
    ...popover,
  };
}

export type ComboboxPopoverState = PopoverState;

export type ComboboxPopoverActions = PopoverActions;

export type ComboboxPopoverInitialState = PopoverInitialState;

export type ComboboxPopoverStateReturn = ComboboxPopoverState &
  ComboboxPopoverActions;
