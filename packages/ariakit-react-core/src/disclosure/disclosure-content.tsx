import { useState } from "react";
import { invariant } from "@ariakit/core/utils/misc";
import { DialogScopedContextProvider } from "../dialog/dialog-context.js";
import {
  useId,
  useMergeRefs,
  useSafeLayoutEffect,
  useWrapElement,
} from "../utils/hooks.js";
import { useStoreState } from "../utils/store.js";
import {
  createComponent,
  createElement,
  createHook,
} from "../utils/system.jsx";
import type { As, Options, Props } from "../utils/types.js";
import { useDisclosureProviderContext } from "./disclosure-context.jsx";
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
export const useDisclosureContent = createHook<DisclosureContentOptions>(
  ({ store, alwaysVisible, ...props }) => {
    const context = useDisclosureProviderContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "DisclosureContent must receive a `store` prop or be wrapped in a DisclosureProvider component.",
    );

    const id = useId(props.id);
    const [transition, setTransition] = useState<TransitionState>(null);
    const open = store.useState("open");
    const mounted = store.useState("mounted");
    const animated = store.useState("animated");
    const contentElement = store.useState("contentElement");
    const otherElement = useStoreState(store.disclosure, "contentElement");

    // TODO: Comment (check combobox-radix-select example)
    useSafeLayoutEffect(() => {
      let previousAnimated: boolean | number | undefined;
      store?.setState("animated", (animated) => {
        previousAnimated = animated;
        return true;
      });
      return () => {
        if (previousAnimated === undefined) return;
        // store?.setState("animated", previousAnimated);
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
      if (!transition) return;
      if (!contentElement) return;
      // Ignore transition states that don't match the current open state. This
      // may happen because transitions are updated asynchronously using
      // requestAnimationFrame.
      if (transition === "leave" && open) return;
      if (transition === "enter" && !open) return;
      const stopAnimation = () => store?.setState("animating", false);
      // When the animated state is a number, the user has manually set the
      // animation timeout, so we just respect it.
      if (typeof animated === "number") {
        const timeoutMs = animated;
        return afterTimeout(timeoutMs, stopAnimation);
      }
      // We need to parse the CSS transition/animation duration and
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
      const timeoutMs = delay + duration;
      // If the timeout is zero, there's no animation or transition, either
      // because they weren't defined in the CSS or the duration was explicitly
      // set to zero. In this scenario, we can halt the animation right away
      // and, if we're entering, we can set the animatedRef to false to bypass
      // the leave animation.
      if (!timeoutMs) {
        if (transition === "enter") {
          store.setState("animated", false);
        }
        stopAnimation();
        return;
      }
      return afterTimeout(timeoutMs, stopAnimation);
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
    const style = hidden ? { ...props.style, display: "none" } : props.style;

    props = {
      id,
      "data-open": open || undefined,
      "data-enter": transition === "enter" ? "" : undefined,
      "data-leave": transition === "leave" ? "" : undefined,
      hidden,
      ...props,
      ref: useMergeRefs(id ? store.setContentElement : null, props.ref),
      style,
    };

    return props;
  },
);

const DisclosureContentImpl = createComponent<DisclosureContentOptions>(
  (props) => {
    const htmlProps = useDisclosureContent(props);
    return createElement("div", htmlProps);
  },
);

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
export const DisclosureContent = createComponent<DisclosureContentOptions>(
  ({ unmountOnHide, ...props }) => {
    const context = useDisclosureProviderContext();
    const store = props.store || context;
    const mounted = useStoreState(
      store,
      (state) => !unmountOnHide || state?.mounted,
    );
    if (mounted === false) return null;
    return <DisclosureContentImpl {...props} />;
  },
);

if (process.env.NODE_ENV !== "production") {
  DisclosureContent.displayName = "DisclosureContent";
}

export interface DisclosureContentOptions<T extends As = "div">
  extends Options<T> {
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

export type DisclosureContentProps<T extends As = "div"> = Props<
  DisclosureContentOptions<T>
>;
