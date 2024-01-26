import { useMemo, useRef, useState } from "react";
import type { ElementType } from "react";
import { invariant, removeUndefinedValues } from "@ariakit/core/utils/misc";
import { flushSync } from "react-dom";
import { DialogScopedContextProvider } from "../dialog/dialog-context.js";
import {
  useId,
  useMergeRefs,
  useSafeLayoutEffect,
  useWrapElement,
} from "../utils/hooks.js";
import { useStoreState } from "../utils/store.js";
import { createElement, createHook, forwardRef } from "../utils/system.jsx";
import type { Options, Props } from "../utils/types.js";
import { useDisclosureProviderContext } from "./disclosure-context.jsx";
import type { DisclosureStore } from "./disclosure-store.js";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];
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
      const multiplier = currentTimeString.endsWith("ms") ? 1 : 1000;
      const currentTime = parseFloat(currentTimeString || "0s") * multiplier;
      // When multiple times are specified, we want to use the longest one so we
      // wait until the longest transition has finished.
      if (currentTime > longestTime) return currentTime;
      return longestTime;
    }, 0);
}

export function isHidden(
  mounted: boolean,
  hidden?: boolean | null,
  alwaysVisible?: boolean | null,
) {
  return !alwaysVisible && hidden !== false && (!mounted || !!hidden);
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
export const useDisclosureContent = createHook<
  TagName,
  DisclosureContentOptions
>(function useDisclosureContent({ store, alwaysVisible, ...props }) {
  const context = useDisclosureProviderContext();
  store = store || context;

  invariant(
    store,
    process.env.NODE_ENV !== "production" &&
      "DisclosureContent must receive a `store` prop or be wrapped in a DisclosureProvider component.",
  );

  const ref = useRef<HTMLType>(null);
  const id = useId(props.id);
  const [transition, setTransition] = useState<TransitionState>(null);
  const open = store.useState("open");
  const mounted = store.useState("mounted");
  const animated = store.useState("animated");
  const contentElement = store.useState("contentElement");
  const otherElement = useStoreState(store.disclosure, "contentElement");

  // This is a workaround to avoid the content element from being reset to null
  // on fast refresh.
  useSafeLayoutEffect(() => {
    if (!ref.current) return;
    store?.setContentElement(ref.current);
  }, [store]);

  // When the disclosure content element is rendered, we automatically set the
  // animated state to true. If there's no enter animation, the animated state
  // will be set to false later on.
  useSafeLayoutEffect(() => {
    let previousAnimated: boolean | number | undefined;
    store?.setState("animated", (animated) => {
      previousAnimated = animated;
      return true;
    });
    return () => {
      if (previousAnimated === undefined) return;
      store?.setState("animated", previousAnimated);
    };
  }, [store]);

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
      setTransition(open ? "enter" : mounted ? "leave" : null);
    });
  }, [animated, contentElement, open, mounted]);

  useSafeLayoutEffect(() => {
    if (!store) return;
    if (!animated) return;
    const stopAnimation = () => store?.setState("animating", false);
    const stopAnimationSync = () => flushSync(stopAnimation);
    if (!transition || !contentElement) {
      stopAnimation();
      return;
    }
    // Ignore transition states that don't match the current open state. This
    // may happen because transitions are updated asynchronously using
    // requestAnimationFrame.
    if (transition === "leave" && open) return;
    if (transition === "enter" && !open) return;
    // When the animated state is a number, the user has manually set the
    // animation timeout, so we just respect it.
    if (typeof animated === "number") {
      const timeout = animated;
      return afterTimeout(timeout, stopAnimationSync);
    }
    // We need to parse the CSS transition/animation duration and delay to know
    // when the animation ends. This is safer than relying on the
    // transitionend/animationend events because it's not guaranteed that these
    // events will fire. For example, if the element is removed from the DOM
    // before the animation ends or if the animation wasn't triggered in the
    // first place, the events won't fire. Besides, there may be multiple
    // transitions or animations with different durations and delays, and we
    // need to consider the longest one.
    const {
      transitionDuration,
      animationDuration,
      transitionDelay,
      animationDelay,
    } = getComputedStyle(contentElement);
    // If we're rendering a dialog backdrop, otherElement will be the dialog
    // element itself. We need to consider both the backdrop and the dialog
    // animation/transition durations and delays because the dialog may be
    // animated while the backdrop is not.
    const {
      transitionDuration: transitionDuration2 = "0",
      animationDuration: animationDuration2 = "0",
      transitionDelay: transitionDelay2 = "0",
      animationDelay: animationDelay2 = "0",
    } = otherElement ? getComputedStyle(otherElement) : {};
    const delay = parseCSSTime(
      transitionDelay,
      animationDelay,
      transitionDelay2,
      animationDelay2,
    );
    const duration = parseCSSTime(
      transitionDuration,
      animationDuration,
      transitionDuration2,
      animationDuration2,
    );
    const timeout = delay + duration;
    // If the timeout is zero, there's no animation or transition, either
    // because they weren't defined in the CSS or the duration was explicitly
    // set to zero. In this scenario, we can halt the animation right away
    // and, if we're entering, we can set the animatedRef to false to bypass
    // the leave animation.
    if (!timeout) {
      if (transition === "enter") {
        store.setState("animated", false);
      }
      stopAnimation();
      return;
    }
    // Since setTimeout may be delayed by a few milliseconds, we need to
    // subtract a frame duration from the timeout to make sure the animation is
    // stopped right after it ends, preventing flickering.
    const frameRate = 1000 / 60;
    const maxTimeout = Math.max(timeout - frameRate, 0);
    return afterTimeout(maxTimeout, stopAnimationSync);
  }, [store, animated, contentElement, otherElement, open, transition]);

  props = useWrapElement(
    props,
    (element) => (
      <DialogScopedContextProvider value={store}>
        {element}
      </DialogScopedContextProvider>
    ),
    [store],
  );

  const hidden = isHidden(mounted, props.hidden, alwaysVisible);
  const styleProp = props.style;
  const style = useMemo(() => {
    if (hidden) return { ...styleProp, display: "none" };
    return styleProp;
  }, [hidden, styleProp]);

  props = {
    id,
    "data-open": open || undefined,
    "data-enter": transition === "enter" || undefined,
    "data-leave": transition === "leave" || undefined,
    hidden,
    ...props,
    ref: useMergeRefs(id ? store.setContentElement : null, ref, props.ref),
    style,
  };

  return removeUndefinedValues(props);
});

const DisclosureContentImpl = forwardRef(function DisclosureContentImpl(
  props: DisclosureContentProps,
) {
  const htmlProps = useDisclosureContent(props);
  return createElement(TagName, htmlProps);
});

/**
 * Renders an element that can be shown or hidden by a
 * [`Disclosure`](https://ariakit.org/components/disclosure) component.
 * @see https://ariakit.org/components/disclosure
 * @example
 * ```jsx {3}
 * <DisclosureProvider>
 *   <Disclosure>Disclosure</Disclosure>
 *   <DisclosureContent>Content</DisclosureContent>
 * </DisclosureProvider>
 * ```
 */
export const DisclosureContent = forwardRef(function DisclosureContent({
  unmountOnHide,
  ...props
}: DisclosureContentProps) {
  const context = useDisclosureProviderContext();
  const store = props.store || context;
  const mounted = useStoreState(
    store,
    (state) => !unmountOnHide || state?.mounted,
  );
  if (mounted === false) return null;
  return <DisclosureContentImpl {...props} />;
});

export interface DisclosureContentOptions<_T extends ElementType = TagName>
  extends Options {
  /**
   * Object returned by the
   * [`useDisclosureStore`](https://ariakit.org/reference/use-disclosure-store)
   * hook. If not provided, the closest
   * [`DisclosureProvider`](https://ariakit.org/reference/disclosure-provider)
   * component's context will be used.
   */
  store?: DisclosureStore;
  /**
   * Determines whether the content element should remain visible even when the
   * [`open`](https://ariakit.org/reference/disclosure-provider#open) state is
   * `false`. If this prop is set to `true`, the `hidden` prop and the `display:
   * none` style will not be applied, unless explicitly set otherwise.
   *
   * This prop is particularly useful when using third-party animation libraries
   * such as Framer Motion or React Spring, where the element needs to be
   * visible for exit animations to work.
   *
   * Live examples:
   * - [Dialog with Framer
   *   Motion](https://ariakit.org/examples/dialog-framer-motion)
   * - [Menu with Framer
   *   Motion](https://ariakit.org/examples/menu-framer-motion)
   * - [Tooltip with Framer
   *   Motion](https://ariakit.org/examples/tooltip-framer-motion)
   * - [Dialog with details &
   *   summary](https://ariakit.org/examples/dialog-details)
   * @default false
   */
  alwaysVisible?: boolean;
  /**
   * When set to `true`, the content element will be unmounted and removed from
   * the DOM when it's hidden.
   *
   * Live examples:
   * - [Navigation Menubar](https://ariakit.org/examples/menubar-navigation)
   * - [Combobox with integrated
   *   filter](https://ariakit.org/examples/combobox-filtering-integrated)
   * - [Textarea with inline
   *   Combobox](https://ariakit.org/examples/combobox-textarea)
   * - [Standalone Popover](https://ariakit.org/examples/popover-standalone)
   * - [Animated Select](https://ariakit.org/examples/select-animated)
   * - [Multi-Select](https://ariakit.org/examples/select-multiple)
   * @default false
   */
  unmountOnHide?: boolean;
}

export type DisclosureContentProps<T extends ElementType = TagName> = Props<
  T,
  DisclosureContentOptions<T>
>;
