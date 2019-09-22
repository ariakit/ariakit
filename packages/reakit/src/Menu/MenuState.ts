import * as React from "react";
import {
  SealedInitialState,
  useSealedState
} from "reakit-utils/useSealedState";
import {
  PopoverState,
  PopoverActions,
  PopoverInitialState,
  usePopoverState
} from "../Popover/PopoverState";
import {
  MenuBarState,
  MenuBarActions,
  MenuBarInitialState,
  useMenuBarState
} from "./MenuBarState";
import { MenuContext } from "./__utils/MenuContext";

export type MenuState = MenuBarState & PopoverState;

export type MenuActions = MenuBarActions & PopoverActions;

export type MenuInitialState = MenuBarInitialState & PopoverInitialState;

export type MenuStateReturn = MenuState & MenuActions;

export function useMenuState(
  initialState: SealedInitialState<MenuInitialState> = {}
): MenuStateReturn {
  const { orientation = "vertical", gutter = 0, ...sealed } = useSealedState(
    initialState
  );

  const parent = React.useContext(MenuContext);

  const placement =
    sealed.placement ||
    (parent && parent.orientation === "vertical"
      ? "right-start"
      : "bottom-start");

  const menuBar = useMenuBarState({ ...sealed, orientation });
  const popover = usePopoverState({
    ...sealed,
    placement,
    gutter
  });

  React.useEffect(() => {
    if (!popover.visible) {
      menuBar.unstable_reset();
    }
  }, [popover.visible]);

  return {
    ...menuBar,
    ...popover
  };
}

const keys: Array<keyof MenuStateReturn> = [
  ...useMenuBarState.__keys,
  ...usePopoverState.__keys
];

useMenuState.__keys = keys;
