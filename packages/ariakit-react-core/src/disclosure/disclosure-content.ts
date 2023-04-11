import { useState } from "react";
import { useForkRef, useId, useSafeLayoutEffect } from "../utils/hooks.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Options, Props } from "../utils/types.js";
import type { DisclosureStore } from "./disclosure-store.js";

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
 * Returns props to create a `DislosureContent` component.
 * @see https://ariakit.org/components/disclosure
 * @example
 * ```jsx
 * const store = useDisclosureStore();
 * const props = useDisclosureContent({ store });
 * <Disclosure store={store}>Disclosure</Disclosure>
 * <Role {...props}>Content</Role>
 * ```
 */
export const useDisclosureContent = createHook<DisclosureContentOptions>(
  ({ store, ...props }) => {
    const id = useId(props.id);
    const [transition, setTransition] = useState<TransitionState>(null);
    const open = store.useState("open");
    const mounted = store.useState("mounted");
    const animated = store.useState("animated");
    const contentElement = store.useState("contentElement");

    useSafeLayoutEffect(() => {
      if (!animated) return;
      // When the disclosure content element is rendered in a portal, we need to
      // wait for the portal to be mounted and connected to the DOM before we
      // can start the animation.
      if (!contentElement?.isConnected) {
        setTransition(null);
        return;
      }
      // Double requestAnimationFrame is necessary here to avoid potential bugs
      // when the data attribute is added before the element is fully rendered
      // in the DOM, which wouldn't trigger the animation.
      return afterPaint(() => {
        setTransition(open ? "enter" : "leave");
      });
    }, [animated, contentElement, open]);

    useSafeLayoutEffect(() => {
      if (!animated) return;
      if (!contentElement) return;
      if (!transition) return;
      if (transition === "enter" && !open) return;
      if (transition === "leave" && open) return;
      // When the animated state is a number, the user has manually set the
      // animation timeout, so we just respect it.
      if (typeof animated === "number") {
        const timeoutMs = animated;
        return afterTimeout(timeoutMs, store.stopAnimation);
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
      } = getComputedStyle(contentElement);
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
      return afterTimeout(timeoutMs, store.stopAnimation);
    }, [animated, contentElement, open, transition]);

    const style =
      // TODO: props.hidden !== true see combobox-textarea example
      (mounted && props.hidden !== true) || props.hidden === false
        ? props.style
        : { ...props.style, display: "none" };

    props = {
      id,
      "data-enter": transition === "enter" ? "" : undefined,
      "data-leave": transition === "leave" ? "" : undefined,
      hidden: !mounted,
      ...props,
      ref: useForkRef(id ? store.setContentElement : null, props.ref),
      style,
    };

    return props;
  }
);

/**
 * Renders an element that can be shown or hidden.
 * @see https://ariakit.org/components/disclosure
 * @example
 * ```jsx
 * const disclosure = useDisclosureStore();
 * <Disclosure store={disclosure}>Disclosure</Disclosure>
 * <DisclosureContent store={disclosure}>Content</DisclosureContent>
 * ```
 */
export const DisclosureContent = createComponent<DisclosureContentOptions>(
  (props) => {
    const htmlProps = useDisclosureContent(props);
    return createElement("div", htmlProps);
  }
);

if (process.env.NODE_ENV !== "production") {
  DisclosureContent.displayName = "DisclosureContent";
}

export interface DisclosureContentOptions<T extends As = "div">
  extends Options<T> {
  /**
   * Object returned by the `useDisclosureStore` hook.
   */
  store: DisclosureStore;
}

export type DisclosureContentProps<T extends As = "div"> = Props<
  DisclosureContentOptions<T>
>;
