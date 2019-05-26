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
  /**
   * TODO: Description.
   */
  unstable_animated: boolean | number;
  /**
   * TODO: Description
   */
  unstable_animating: boolean;
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
  /**
   * Flushes `animatedVisible`.
   */
  unstable_flushAnimation: () => void;
};

export type HiddenInitialState = Partial<
  Pick<HiddenState, "unstable_hiddenId" | "visible" | "unstable_animated">
>;

export type HiddenStateReturn = HiddenState & HiddenActions;

function useLastValue<T>(value: T) {
  const lastValue = React.useRef<T | null>(null);
  React.useLayoutEffect(() => {
    lastValue.current = value;
  }, [value]);
  return lastValue;
}

export function useHiddenState(
  initialState: unstable_SealedInitialState<HiddenInitialState> = {}
): HiddenStateReturn {
  const {
    unstable_hiddenId: hiddenId = unstable_useId("hidden-"),
    unstable_animated: animated = false,
    visible: sealedVisible = false
  } = unstable_useSealedState(initialState);

  const [visible, setVisible] = React.useState(sealedVisible);
  const [animating, setAnimating] = React.useState(false);
  const lastVisible = useLastValue(visible);

  if (!lastVisible.current && visible && !animating && animated) {
    setAnimating(true);
  }

  React.useLayoutEffect(() => {
    if (!animated || visible) return undefined;

    if (typeof animated === "number") {
      const id = setTimeout(() => setAnimating(false), animated);
      return () => clearTimeout(id);
    }

    return undefined;
  }, [animated, visible]);

  const show = React.useCallback(() => setVisible(true), []);

  const hide = React.useCallback(() => setVisible(false), []);

  const toggle = React.useCallback(() => setVisible(v => !v), []);

  const flushAnimation = React.useCallback(() => setAnimating(visible), [
    visible
  ]);

  return {
    unstable_hiddenId: hiddenId,
    unstable_animated: animated,
    unstable_animating: animating,
    visible,
    show,
    hide,
    toggle,
    unstable_flushAnimation: flushAnimation
  };
}

const keys: Array<keyof HiddenStateReturn> = [
  "unstable_hiddenId",
  "unstable_animated",
  "unstable_animating",
  "visible",
  "show",
  "hide",
  "toggle",
  "unstable_flushAnimation"
];

useHiddenState.__keys = keys;
