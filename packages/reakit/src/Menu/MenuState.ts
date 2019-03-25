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
import { Keys } from "../__utils/types";

export type unstable_MenuState = unstable_RoverState &
  unstable_PopoverState & {
    /** TODO: Description */
    unstable_values: Record<string, any>;
    /** TODO: Description */
    unstable_parent?: unstable_RoverStateReturn;
  };

export type unstable_MenuActions = unstable_RoverActions &
  unstable_PopoverActions & {
    /** TODO: Description */
    unstable_update: (name: string, value?: any) => void;
  };

export type unstable_MenuInitialState = unstable_RoverInitialState &
  unstable_PopoverInitialState &
  Partial<Pick<unstable_MenuState, "unstable_values">>;

export type unstable_MenuStateReturn = unstable_MenuState &
  unstable_MenuActions;

export function useMenuState(
  initialState: SealedInitialState<unstable_MenuInitialState> = {},
  unstable_parent?: unstable_RoverStateReturn
): unstable_MenuStateReturn {
  const {
    orientation = "vertical",
    unstable_gutter: gutter = 0,
    unstable_values: initialValues = {},
    ...sealed
  } = useSealedState(initialState);
  const [values, setValues] = React.useState(initialValues);

  const placement =
    sealed.placement ||
    (unstable_parent && unstable_parent.orientation === "vertical"
      ? "right-start"
      : "bottom-start");

  const rover = useRoverState({ ...sealed, orientation });
  const popover = usePopoverState({
    ...sealed,
    placement,
    unstable_gutter: gutter
  });

  React.useEffect(() => {
    if (!popover.visible) {
      rover.unstable_reset();
    }
  }, [popover.visible]);

  return {
    ...rover,
    ...popover,
    unstable_parent: React.useMemo(
      () => unstable_parent,
      Object.values(unstable_parent || {})
    ),
    unstable_values: values,
    unstable_update: React.useCallback((name, value) => {
      setValues(vals => ({
        ...vals,
        [name]: typeof value === "function" ? value(vals) : value
      }));
    }, [])
  };
}

const keys: Keys<unstable_MenuStateReturn> = [
  ...useRoverState.__keys,
  ...usePopoverState.__keys,
  "unstable_parent",
  "unstable_values",
  "unstable_update"
];

useMenuState.__keys = keys;
