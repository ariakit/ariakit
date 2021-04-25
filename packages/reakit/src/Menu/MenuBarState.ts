import * as React from "react";
import { InitialState } from "reakit-utils/types";
import { useInitialValue } from "reakit-utils/hooks";
import {
  CompositeState,
  CompositeActions,
  CompositeInitialState,
  useCompositeState,
} from "../Composite";

export type MenuBarState = CompositeState & {
  /**
   * Stores the values of radios and checkboxes within the menu.
   */
  unstable_values: Record<string, any>;
};

export type MenuBarActions = CompositeActions & {
  /**
   * Updates checkboxes and radios values within the menu.
   */
  unstable_setValue: (name: string, value?: any) => void;
};

export type MenuBarInitialState = CompositeInitialState &
  Partial<Pick<MenuBarState, "unstable_values">>;

export type MenuBarStateReturn = MenuBarState & MenuBarActions;

export function useMenuBarState(
  initialState: InitialState<MenuBarInitialState> = {}
): MenuBarStateReturn {
  const {
    orientation = "horizontal",
    unstable_values: initialValues = {},
    ...sealed
  } = useInitialValue(initialState);

  const [values, setValues] = React.useState(initialValues);
  const composite = useCompositeState({ ...sealed, orientation });

  return {
    ...composite,
    unstable_values: values,
    unstable_setValue: React.useCallback((name, value) => {
      setValues((vals) => ({
        ...vals,
        [name]: typeof value === "function" ? value(vals) : value,
      }));
    }, []),
  };
}
