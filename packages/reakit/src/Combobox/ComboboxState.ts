import * as React from "react";
import {
  SealedInitialState,
  useSealedState,
} from "reakit-utils/useSealedState";
import {
  useCompositeState,
  CompositeState,
  CompositeActions,
  CompositeInitialState,
} from "../Composite/CompositeState";

export type unstable_ComboboxState = CompositeState & {
  state: string;
};

export type unstable_ComboboxActions = CompositeActions & {
  matches: (value?: string) => boolean;
  setState: React.Dispatch<
    React.SetStateAction<unstable_ComboboxState["state"]>
  >;
};

export type unstable_ComboboxInitialState = Omit<
  CompositeInitialState,
  "unstable_virtual"
> &
  Pick<Partial<unstable_ComboboxState>, "state">;

export type unstable_ComboboxStateReturn = unstable_ComboboxState &
  unstable_ComboboxActions;

export function unstable_useComboboxState(
  initialState: SealedInitialState<unstable_ComboboxInitialState> = {}
): unstable_ComboboxStateReturn {
  const {
    state: initialValue = "",
    currentId = null,
    ...sealed
  } = useSealedState(initialState);
  const composite = useCompositeState({
    currentId,
    ...sealed,
    unstable_virtual: true,
  });
  const [state, setState] = React.useState(initialValue);
  return {
    ...composite,
    matches: React.useCallback((value) => !!value?.startsWith(state), [state]),
    state,
    setState,
  };
}
