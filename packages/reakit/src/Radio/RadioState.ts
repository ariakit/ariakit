import * as React from "react";
import { InitialState } from "reakit-utils/types";
import { useInitialValue } from "reakit-utils/hooks";
import {
  CompositeState,
  CompositeActions,
  CompositeInitialState,
  useCompositeState,
} from "../Composite";

export type RadioState = CompositeState & {
  /**
   * The `value` attribute of the current checked radio.
   */
  state: string | number | undefined;
};

export type RadioActions = CompositeActions & {
  /**
   * Sets `state`.
   */
  setState: React.Dispatch<React.SetStateAction<string | number | undefined>>;
};

export type RadioInitialState = CompositeInitialState &
  Partial<Pick<RadioState, "state">>;

export type RadioStateReturn = RadioState & RadioActions;

export function useRadioState(
  initialState: InitialState<RadioInitialState> = {}
): RadioStateReturn {
  const { state: initialValue, loop = true, ...sealed } = useInitialValue(
    initialState
  );
  const [state, setState] = React.useState(initialValue);
  const composite = useCompositeState({ ...sealed, loop });
  return {
    ...composite,
    state,
    setState,
  };
}
