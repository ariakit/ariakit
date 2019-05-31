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
   * If `true`, `animating` will be set to `true` when `visible` changes.
   * It'll wait for `stopAnimation` to be called or a CSS transition ends.
   * If it's a number, `stopAnimation` will be called automatically after
   * given milliseconds.
   */
  unstable_animated: boolean | number;
  /**
   * Whether it's animating or not.
   * @private
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
   * Stops animation. It's called automatically if there's a CSS transition.
   * It's called after given milliseconds if `animated` is a number.
   */
  unstable_stopAnimation: () => void;
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

  if (
    animated &&
    !animating &&
    lastVisible.current != null &&
    lastVisible.current !== visible
  ) {
    // Sets animating to true when when visible changes
    setAnimating(true);
  }

  React.useLayoutEffect(() => {
    if (visible || typeof animated !== "number") return undefined;
    // Stops animation after an interval defined by animated
    const id = setTimeout(() => setAnimating(false), animated);
    return () => clearTimeout(id);
  }, [animated, visible]);

  const show = React.useCallback(() => setVisible(true), []);

  const hide = React.useCallback(() => setVisible(false), []);

  const toggle = React.useCallback(() => setVisible(v => !v), []);

  const stopAnimation = React.useCallback(() => setAnimating(false), []);

  return {
    unstable_hiddenId: hiddenId,
    unstable_animated: animated,
    unstable_animating: animating,
    visible,
    show,
    hide,
    toggle,
    unstable_stopAnimation: stopAnimation
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
  "unstable_stopAnimation"
];

useHiddenState.__keys = keys;
