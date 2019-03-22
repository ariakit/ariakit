import * as React from "react";
import { SealedInitialState, useSealedState } from "../__utils/useSealedState";
import {
  unstable_RoverState,
  unstable_RoverActions,
  unstable_RoverInitialState,
  unstable_RoverStateReturn,
  useRoverState
} from "../Rover/RoverState";
import {
  unstable_PopoverState,
  unstable_PopoverActions,
  unstable_PopoverInitialState,
  usePopoverState
} from "../Popover/PopoverState";

export type unstable_MenuState = unstable_RoverState &
  unstable_PopoverState & {
    /** TODO: Description */
    values: Record<string, any>;
    /** TODO: Description */
    parent?: unstable_RoverStateReturn;
  };

export type unstable_MenuActions = unstable_RoverActions &
  unstable_PopoverActions & {
    /** TODO: Description */
    update: (name: string, value?: any) => void;
  };

export type unstable_MenuInitialState = unstable_RoverInitialState &
  unstable_PopoverInitialState &
  Partial<Pick<unstable_MenuState, "values">>;

export type unstable_MenuStateReturn = unstable_MenuState &
  unstable_MenuActions;

export function useMenuState(
  initialState: SealedInitialState<unstable_MenuInitialState> = {},
  parent?: unstable_RoverStateReturn
): unstable_MenuStateReturn {
  const {
    orientation = "vertical",
    gutter = 0,
    values: initialValues = {},
    ...sealed
  } = useSealedState(initialState);
  const [values, setValues] = React.useState(initialValues);

  const placement =
    sealed.placement ||
    (parent && parent.orientation === "vertical"
      ? "right-start"
      : "bottom-start");

  const rover = useRoverState({ ...sealed, orientation });
  const popover = usePopoverState({ ...sealed, placement, gutter });

  React.useEffect(() => {
    if (!popover.visible) {
      rover.reset();
    }
  }, [popover.visible]);

  return {
    ...rover,
    ...popover,
    parent,
    values,
    update: React.useCallback((name, value) => {
      setValues(vals => ({
        ...vals,
        [name]: typeof value === "function" ? value(vals) : value
      }));
    }, [])
  };
}

const keys: Array<keyof unstable_MenuStateReturn> = [
  ...useRoverState.keys,
  ...usePopoverState.keys,
  "parent",
  "values",
  "update"
];

useMenuState.keys = keys;
