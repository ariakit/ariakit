import * as React from "react";
import { SealedInitialState, useSealedState } from "reakit-utils";
import {
  unstable_IdActions,
  unstable_IdInitialState,
  unstable_IdState,
  unstable_useIdState,
} from "reakit/Id";

export type AlertState = unstable_IdState & {
  /**
   * Whether it's visible or not.
   */
  visible: boolean;
};

export type AlertActions = unstable_IdActions & {
  /**
   * Changes the `visible` state to `true`
   */
  show: () => void;
  /**
   * Changes the `visible` state to `false`
   */
  hide: () => void;
  /**
   * Toggles the `visible` state
   */
  toggle: () => void;
  /**
   * Sets `visible`.
   */
  setVisible: React.Dispatch<React.SetStateAction<AlertState["visible"]>>;
};

export type AlertInitialState = unstable_IdInitialState &
  Partial<Pick<AlertState, "visible">>;

export type AlertStateReturn = AlertState & AlertActions;

export function useAlertState(
  initialState: SealedInitialState<AlertInitialState> = {}
): AlertStateReturn {
  const { visible: initialVisible = true, ...sealed } = useSealedState(
    initialState
  );
  const [visible, setVisible] = React.useState(initialVisible);
  const id = unstable_useIdState(sealed);
  const show = React.useCallback(() => setVisible(true), []);
  const hide = React.useCallback(() => setVisible(false), []);
  const toggle = React.useCallback(() => setVisible((v) => !v), []);

  return { visible, show, hide, toggle, setVisible, ...id };
}
