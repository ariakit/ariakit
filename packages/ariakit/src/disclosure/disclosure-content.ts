import { useState } from "react";
import { useForkRef, useId, useSafeLayoutEffect } from "ariakit-utils/hooks";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, Options, Props } from "ariakit-utils/types";
import { flushSync } from "react-dom";
import { DisclosureState } from "./disclosure-state";

type TransitionState = "enter" | "leave" | null;

function afterTimeout(timeoutMs: number, cb: () => void) {
  const timeoutId = setTimeout(cb, timeoutMs);
  return () => clearTimeout(timeoutId);
}

function afterPaint(cb: () => void) {
  let raf = requestAnimationFrame(() => {
    raf = requestAnimationFrame(cb);
  });
  return () => cancelAnimationFrame(raf);
}

function parseCSSTime(...times: string[]) {
  return times
    .join(", ")
    .split(", ")
    .reduce((longestTime, currentTimeString) => {
      const currentTime = parseFloat(currentTimeString || "0s") * 1000;
      // When multiple times are specified, we want to use the longest one so we
      // wait until the longest transition has finished.
      if (currentTime > longestTime) return currentTime;
      return longestTime;
    }, 0);
}

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render an element that can be shown or hidden.
 * @see https://ariakit.org/components/disclosure
 * @example
 * ```jsx
 * const state = useDisclosureState();
 * const props = useDisclosureContent({ state });
 * <Disclosure state={state}>Disclosure</Disclosure>
 * <Role {...props}>Content</Role>
 * ```
 */
export const useDisclosureContent = createHook<DisclosureContentOptions>(
  ({ state, ...props }) => {
    const id = useId(props.id);
    const [transition, setTransition] = useState<TransitionState>(null);

    useSafeLayoutEffect(() => {
      if (!state.animated) return;
      // When the disclosure content element is rendered in a portal, we need to
      // wait for the portal to be mounted and connected to the DOM before we
      // can start the animation.
      if (!state.contentElement?.isConnected) {
        setTransition(null);
        return;
      }
      // Double requestAnimationFrame is necessary here to avoid potential bugs
      // when the data attribute is added before the element is fully rendered
      // in the DOM, which wouldn't trigger the animation.
      return afterPaint(() => {
        setTransition(state.open ? "enter" : "leave");
      });
    }, [state.animated, state.contentElement, state.open]);

    useSafeLayoutEffect(() => {
      if (!state.animated) return;
      if (!state.contentElement) return;
      if (!transition) return;
      if (transition === "enter" && !state.open) return;
      if (transition === "leave" && state.open) return;
      // When the animated state is a number, the user has manually set the
      // animation timeout, so we just respect it.
      if (typeof state.animated === "number") {
        const timeoutMs = state.animated;
        return afterTimeout(timeoutMs, () => flushSync(state.stopAnimation));
      }
      // Otherwise, we need to parse the CSS transition/animation duration and
      // delay to know when the animation ends. This is safer than relying on
      // the transitionend/animationend events because it's not guaranteed that
      // these events will fire. For example, if the element is removed from the
      // DOM before the animation ends or if the animation wasn't triggered in
      // the first place, the events won't fire.
      const {
        transitionDuration,
        animationDuration,
        transitionDelay,
        animationDelay,
      } = getComputedStyle(state.contentElement);
      const delay = parseCSSTime(transitionDelay, animationDelay);
      const duration = parseCSSTime(transitionDuration, animationDuration);
      const timeoutMs = delay + duration;
      // If the animation/transition delay and duration are 0, this means the
      // element is not animated with CSS (they may be using framer-motion,
      // react-spring, or something else). In this case, the user is responsible
      // for calling `stopAnimation` when the animation ends.
      if (!timeoutMs) return;
      // TODO: We should probably warn if `stopAnimation` hasn't been called
      // after X seconds.
      return afterTimeout(timeoutMs, () => flushSync(state.stopAnimation));
    }, [
      state.animated,
      state.contentElement,
      transition,
      state.open,
      state.stopAnimation,
    ]);

    const style =
      state.mounted || props.hidden === false
        ? props.style
        : { ...props.style, display: "none" };

    props = {
      id,
      "data-enter": transition === "enter" ? "" : undefined,
      "data-leave": transition === "leave" ? "" : undefined,
      hidden: !state.mounted,
      ...props,
      ref: useForkRef(id ? state.setContentElement : null, props.ref),
      style,
    };

    return props;
  }
);

/**
 * A component that renders an element that can be shown or hidden.
 * @see https://ariakit.org/components/disclosure
 * @example
 * ```jsx
 * const disclosure = useDisclosureState();
 * <Disclosure state={disclosure}>Disclosure</Disclosure>
 * <DisclosureContent state={disclosure}>Content</DisclosureContent>
 * ```
 */
export const DisclosureContent = createComponent<DisclosureContentOptions>(
  (props) => {
    const htmlProps = useDisclosureContent(props);
    return createElement("div", htmlProps);
  }
);

export type DisclosureContentOptions<T extends As = "div"> = Options<T> & {
  /**
   * Object returned by the `useDisclosureState` hook.
   */
  state: DisclosureState;
};

export type DisclosureContentProps<T extends As = "div"> = Props<
  DisclosureContentOptions<T>
>;
