import * as React from "react";

export type HiddenState = {
  /**
   * Tell whether it's visible or not
   */
  visible: boolean;
  /**
   * Change the `visible` state to `true`
   */
  show: () => void;
  /**
   * Change the `visible` state to `false`
   */
  hide: () => void;
  /**
   * Toggle the `visible` state
   */
  toggle: () => void;
};

export type UseHiddenStateOptions = {
  /**
   * Tell whether it's visible or not
   * @default false
   */
  visible?: boolean;
};

export function useHiddenState({
  visible: initialVisible = false
}: UseHiddenStateOptions = {}): HiddenState {
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

export default useHiddenState;
