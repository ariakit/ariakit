import { SealedInitialState } from "reakit-utils/useSealedState";
import { warning } from "reakit-warning";
import {
  DisclosureState,
  DisclosureActions,
  DisclosureInitialState,
  useDisclosureState,
  DisclosureStateReturn
} from "../Disclosure";

export type HiddenState = DisclosureState;

export type HiddenActions = DisclosureActions;

export type HiddenInitialState = DisclosureInitialState;

export type HiddenStateReturn = DisclosureStateReturn &
  HiddenState &
  HiddenActions;

export function useHiddenState(
  initialState: SealedInitialState<HiddenInitialState> = {}
): HiddenStateReturn {
  warning(
    true,
    "`useHiddenState` has been renamed to `useDisclosureState`. `useHiddenState` will no longer work in future versions.",
    "See https://reakit.io/docs/disclosure"
  );
  return useDisclosureState(initialState);
}

useHiddenState.__keys = useDisclosureState.__keys;
