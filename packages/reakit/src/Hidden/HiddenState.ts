import * as React from "react";
import { unstable_useId } from "../utils/useId";

export type unstable_HiddenState = {
  /** TODO: Description */
  baseId: string;
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
  Pick<unstable_HiddenState, "visible">
>;

export type unstable_HiddenStateReturn = unstable_HiddenState &
  unstable_HiddenActions;

export function useHiddenState({
  visible: initialVisible = false
}: unstable_HiddenInitialState = {}): unstable_HiddenStateReturn {
  const [visible, setVisible] = React.useState(initialVisible);
  const baseId = unstable_useId("hidden-");

  const show = () => {
    if (!visible) setVisible(true);
  };

  const hide = () => {
    if (visible) setVisible(false);
  };

  const toggle = () => setVisible(!visible);

  return {
    baseId,
    visible,
    show,
    hide,
    toggle
  };
}

const keys: Array<keyof unstable_HiddenStateReturn> = [
  "baseId",
  "visible",
  "show",
  "hide",
  "toggle"
];

useHiddenState.keys = keys;
