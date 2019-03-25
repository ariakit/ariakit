import * as React from "react";
import { useSealedState, SealedInitialState } from "../__utils/useSealedState";
import { unstable_useId } from "../utils/useId";
import { Keys } from "../__utils/types";

export type unstable_HiddenState = {
  /**
   * Hidden element id.
   */
  unstable_hiddenId: string;
  /**
   * Whether it's visible or not.
   * @default false
   */
  visible: boolean;
};

export type unstable_HiddenActions = {
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
};

export type unstable_HiddenInitialState = Partial<
  Pick<unstable_HiddenState, "unstable_hiddenId" | "visible">
>;

export type unstable_HiddenStateReturn = unstable_HiddenState &
  unstable_HiddenActions;

export function useHiddenState(
  initialState: SealedInitialState<unstable_HiddenInitialState> = {}
): unstable_HiddenStateReturn {
  const {
    unstable_hiddenId: hiddenId = unstable_useId("hidden-"),
    visible: sealedVisible = false
  } = useSealedState(initialState);

  const [visible, setVisible] = React.useState(sealedVisible);

  const show = React.useCallback(() => setVisible(true), []);

  const hide = React.useCallback(() => setVisible(false), []);

  const toggle = React.useCallback(() => setVisible(v => !v), []);

  return {
    unstable_hiddenId: hiddenId,
    visible,
    show,
    hide,
    toggle
  };
}

const keys: Keys<unstable_HiddenStateReturn> = [
  "unstable_hiddenId",
  "visible",
  "show",
  "hide",
  "toggle"
];

useHiddenState.__keys = keys;
