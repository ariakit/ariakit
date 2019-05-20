import * as React from "react";
import {
  unstable_useSealedState,
  unstable_SealedInitialState
} from "../utils/useSealedState";
import { unstable_useId } from "../utils/useId";

export type HiddenState = {
  /**
   * Hidden element ID.
   * @private
   */
  unstable_hiddenId: string;
  /**
   * Whether it's visible or not.
   */
  visible: boolean;
};

export type HiddenActions = {
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

export type HiddenInitialState = Partial<
  Pick<HiddenState, "unstable_hiddenId" | "visible">
>;

export type HiddenStateReturn = HiddenState & HiddenActions;

export function useHiddenState(
  initialState: unstable_SealedInitialState<HiddenInitialState> = {}
): HiddenStateReturn {
  const {
    unstable_hiddenId: hiddenId = unstable_useId("hidden-"),
    visible: sealedVisible = false
  } = unstable_useSealedState(initialState);

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

const keys: Array<keyof HiddenStateReturn> = [
  "unstable_hiddenId",
  "visible",
  "show",
  "hide",
  "toggle"
];

useHiddenState.__keys = keys;
