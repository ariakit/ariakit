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
  MenuState,
  MenuActions,
  MenuInitialState,
  useMenuState
} from "./__MenuState";
import { MenuContext } from "./__utils/MenuContext";

export type MenuPopoverState = MenuState & PopoverState;

export type MenuPopoverActions = MenuActions & PopoverActions;

export type MenuPopoverInitialState = MenuInitialState & PopoverInitialState;

export type MenuPopoverStateReturn = MenuPopoverState & MenuPopoverActions;

export function useMenuPopoverState(
  initialState: SealedInitialState<MenuPopoverInitialState> = {}
): MenuPopoverStateReturn {
  const { unstable_gutter: initialGutter = 0, ...sealed } = useSealedState(
    initialState
  );

  const parent = React.useContext(MenuContext);

  const placement =
    sealed.placement ||
    (parent && parent.orientation === "vertical"
      ? "right-start"
      : "bottom-start");

  const menu = useMenuState(sealed);
  const popover = usePopoverState({
    ...sealed,
    placement,
    unstable_gutter: initialGutter
  });

  React.useEffect(() => {
    if (!popover.visible) {
      menu.unstable_reset();
    }
  }, [popover.visible]);

  return {
    ...menu,
    ...popover
  };
}

const keys: Array<keyof MenuPopoverStateReturn> = [
  ...useMenuState.__keys,
  ...usePopoverState.__keys
];

useMenuPopoverState.__keys = keys;
