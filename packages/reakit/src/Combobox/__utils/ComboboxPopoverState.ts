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
  const hide = React.useCallback(
    (revertValue?: boolean) => {
      popover.hide();
      if (!revertValue && combobox.currentValue) {
        combobox.setInputValue(combobox.currentValue);
      }
    },
    [popover.hide, combobox.currentValue]
  );
  return {
    ...combobox,
    ...popover,
    hide,
    visible:
      popover.visible && combobox.inputValue.length >= combobox.minValueLength,
  };
}

export type ComboboxPopoverState = PopoverState;

export type ComboboxPopoverActions = Omit<PopoverActions, "hide"> & {
  /**
   * Changes the `visible` state to `false`
   */
  hide: (revertValue?: boolean) => void;
};

export type ComboboxPopoverInitialState = PopoverInitialState;

export type ComboboxPopoverStateReturn = ComboboxPopoverState &
  ComboboxPopoverActions;
