import * as React from "react";
import {
  SealedInitialState,
  useSealedState
} from "reakit-utils/useSealedState";
import {
  RoverState,
  RoverActions,
  RoverInitialState,
  useRoverState
} from "../Rover";

export type MenuBarState = RoverState & {
  /**
   * Stores the values of radios and checkboxes within the menu.
   */
  unstable_values: Record<string, any>;
};

export type MenuBarActions = RoverActions & {
  /**
   * Updates checkboxes and radios values within the menu.
   */
  unstable_update: (name: string, value?: any) => void;
};

export type MenuBarInitialState = RoverInitialState &
  Partial<Pick<MenuBarState, "unstable_values">>;

export type MenuBarStateReturn = MenuBarState & MenuBarActions;

export function useMenuBarState(
  initialState: SealedInitialState<MenuBarInitialState> = {}
): MenuBarStateReturn {
  const {
    orientation = "horizontal",
    unstable_values: initialValues = {},
    ...sealed
  } = useSealedState(initialState);

  const [values, setValues] = React.useState(initialValues);
  const rover = useRoverState({ ...sealed, orientation });

  return {
    ...rover,
    unstable_values: values,
    unstable_update: React.useCallback((name, value) => {
      setValues(vals => ({
        ...vals,
        [name]: typeof value === "function" ? value(vals) : value
      }));
    }, [])
  };
}

const keys: Array<keyof MenuBarStateReturn> = [
  ...useRoverState.__keys,
  "unstable_values",
  "unstable_update"
];

useMenuBarState.__keys = keys;
