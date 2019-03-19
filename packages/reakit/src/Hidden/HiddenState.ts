import * as React from "react";
import { useSealedState, SealedInitialState } from "../__utils/useSealedState";
import { unstable_useId } from "../utils/useId";

export type unstable_HiddenState = {
  /** TODO: Description */
  hiddenId: string;
  /** Tell whether it's visible or not */
  visible: boolean;
};

export type unstable_HiddenActions = {
  /** Change the `visible` state to `true` */
  show: () => void;
  /** Change the `visible` state to `false` */
  hide: () => void;
  /** Toggle the `visible` state */
  toggle: () => void;
};

// TODO: Accept function for the entire options or for each value
export type unstable_HiddenInitialState = Partial<
  Pick<unstable_HiddenState, "hiddenId" | "visible">
>;

export type unstable_HiddenStateReturn = unstable_HiddenState &
  unstable_HiddenActions;

export function useHiddenState(
  initialState: SealedInitialState<unstable_HiddenInitialState> = {}
): unstable_HiddenStateReturn {
  const { visible: sealedVisible = false, ...sealed } = useSealedState(
    initialState
  );
  const [visible, setVisible] = React.useState(sealedVisible);
  const hiddenId = unstable_useId("hidden-");

  const show = React.useCallback(() => setVisible(true), []);

  const hide = React.useCallback(() => setVisible(false), []);

  const toggle = React.useCallback(() => setVisible(!visible), [visible]);

  return {
    hiddenId: sealed.hiddenId || hiddenId,
    visible,
    show,
    hide,
    toggle
  };
}

const keys: Array<keyof unstable_HiddenStateReturn> = [
  "hiddenId",
  "visible",
  "show",
  "hide",
  "toggle"
];

useHiddenState.keys = keys;
