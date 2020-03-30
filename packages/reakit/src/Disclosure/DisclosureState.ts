import * as React from "react";
import {
  useSealedState,
  SealedInitialState
} from "reakit-utils/useSealedState";
import { useIsomorphicEffect } from "reakit-utils/useIsomorphicEffect";
import { warning } from "reakit-warning";
import {
  unstable_IdState,
  unstable_IdActions,
  unstable_IdInitialState,
  unstable_useIdState
} from "../Id/IdState";

export type DisclosureState = unstable_IdState & {
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

export type DisclosureActions = unstable_IdActions & {
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
  /**
   * @private
   */
  unstable_setIsMounted?: React.Dispatch<React.SetStateAction<boolean>>;
};

export type DisclosureInitialState = unstable_IdInitialState &
  Partial<Pick<DisclosureState, "visible" | "unstable_animated">> & {
    /**
     * @private
     */
    unstable_isMounted?: boolean;
  };

export type DisclosureStateReturn = DisclosureState & DisclosureActions;

function useLastValue<T>(value: T) {
  const lastValue = React.useRef<T | null>(null);
  useIsomorphicEffect(() => {
    lastValue.current = value;
  }, [value]);
  return lastValue;
}

export function useDisclosureState(
  initialState: SealedInitialState<DisclosureInitialState> = {}
): DisclosureStateReturn {
  const {
    unstable_animated: animated = false,
    visible: sealedVisible = false,
    unstable_isMounted: initialIsMounted = false,
    ...sealed
  } = useSealedState(initialState);

  const id = unstable_useIdState(sealed);

  const [visible, setVisible] = React.useState(sealedVisible);
  const [animating, setAnimating] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(initialIsMounted);
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

  useIsomorphicEffect(() => {
    if (typeof animated !== "number") return undefined;
    // Stops animation after an interval defined by animated
    const timeoutId = setTimeout(() => setAnimating(false), animated);
    return () => clearTimeout(timeoutId);
  }, [animated]);

  const show = React.useCallback(() => {
    warning(
      !isMounted,
      "You're trying to show a `DisclosureContent` component that hasn't been mounted yet.",
      "You shouldn't conditionally render a `DisclosureContent` component (or any of its derivatives) as this will make some features not work.",
      "If this is intentional, you can omit this warning by passing `unstable_isMounted: true` to `useDisclosureState` or just ignore it.",
      "See https://reakit.io/docs/disclosure/#conditionally-rendering"
    );
    setVisible(true);
  }, [isMounted]);

  const hide = React.useCallback(() => setVisible(false), []);

  const toggle = React.useCallback(() => {
    warning(
      !isMounted,
      "You're trying to toggle a `DisclosureContent` element that hasn't been mounted yet.",
      "You shouldn't conditionally render a `DisclosureContent` component (or any of its derivatives) as this will make some features not work.",
      "If this is intentional, you can omit this warning by passing `unstable_isMounted: true` to `useDisclosureState` or just ignore it.",
      "See https://reakit.io/docs/disclosure/#conditionally-rendering"
    );
    setVisible(v => !v);
  }, [isMounted]);

  const stopAnimation = React.useCallback(() => setAnimating(false), []);

  return {
    ...id,
    unstable_animated: animated,
    unstable_animating: animating,
    visible,
    show,
    hide,
    toggle,
    unstable_stopAnimation: stopAnimation,
    unstable_setIsMounted: setIsMounted
  };
}

const keys: Array<keyof DisclosureStateReturn> = [
  ...unstable_useIdState.__keys,
  "unstable_animated",
  "unstable_animating",
  "visible",
  "show",
  "hide",
  "toggle",
  "unstable_stopAnimation",
  "unstable_setIsMounted"
];

useDisclosureState.__keys = keys;
