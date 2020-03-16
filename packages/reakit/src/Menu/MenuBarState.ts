import * as React from "react";
import {
  SealedInitialState,
  useSealedState
} from "reakit-utils/useSealedState";
import {
  unstable_CompositeState as CompositeState,
  unstable_CompositeActions as CompositeActions,
  unstable_CompositeInitialState as CompositeInitialState,
  unstable_useCompositeState as useCompositeState
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
  initialState: SealedInitialState<MenuBarInitialState> = {}
): MenuBarStateReturn {
  const {
    orientation = "horizontal",
    unstable_values: initialValues = {},
    ...sealed
  } = useSealedState(initialState);

  const [values, setValues] = React.useState(initialValues);
  const composite = useCompositeState({ ...sealed, orientation });

  return {
    ...composite,
    unstable_values: values,
    unstable_setValue: React.useCallback((name, value) => {
      setValues(vals => ({
        ...vals,
        [name]: typeof value === "function" ? value(vals) : value
      }));
    }, [])
  };
}

const keys: Array<keyof MenuBarStateReturn> = [
  ...useCompositeState.__keys,
  "unstable_values",
  "unstable_setValue"
];

useMenuBarState.__keys = keys;
