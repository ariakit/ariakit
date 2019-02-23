import * as React from "react";

export type HiddenState = {
  /** Tell whether it's visible or not */
  visible: boolean;
};

export type HiddenActions = {
  /** Change the `visible` state to `true` */
  show: () => void;
  /** Change the `visible` state to `false` */
  hide: () => void;
  /** Toggle the `visible` state */
  toggle: () => void;
};

export type UseHiddenStateOptions = Partial<HiddenState>;

export function useHiddenState({
  visible: initialVisible = false
}: UseHiddenStateOptions = {}): HiddenState & HiddenActions {
  const [visible, setVisible] = React.useState(initialVisible);

  const show = () => {
    if (!visible) setVisible(true);
  };

  const hide = () => {
    if (visible) setVisible(false);
  };

  const toggle = () => setVisible(!visible);

  return {
    visible,
    show,
    hide,
    toggle
  };
}

const keys: Array<keyof ReturnType<typeof useHiddenState>> = [
  "visible",
  "show",
  "hide",
  "toggle"
];

useHiddenState.keys = keys;
