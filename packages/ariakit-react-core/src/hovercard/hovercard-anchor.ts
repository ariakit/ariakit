import type { MouseEvent as ReactMouseEvent } from "react";
import { useCallback, useEffect, useRef } from "react";
import { addGlobalEventListener } from "@ariakit/core/utils/events";
import { disabledFromProps, invariant } from "@ariakit/core/utils/misc";
import type { BooleanOrCallback } from "@ariakit/core/utils/types";
import type { FocusableOptions } from "../focusable/focusable.js";
import { useFocusable } from "../focusable/focusable.js";
import {
  useBooleanEvent,
  useEvent,
  useIsMouseMoving,
  useMergeRefs,
} from "../utils/hooks.js";
import { createElement, createHook2 } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import { useHovercardProviderContext } from "./hovercard-context.js";
import type { HovercardStore } from "./hovercard-store.js";

/**
 * Returns props to create a `HovercardAnchor` component.
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx
 * const store = useHovercardStore();
 * const props = useHovercardAnchor({ store });
 * <Role {...props} render={<a />}>@username</Role>
 * <Hovercard store={store}>Details</Hovercard>
 * ```
 */
export const useHovercardAnchor = createHook2<TagName, HovercardAnchorOptions>(
  ({ store, showOnHover = true, ...props }) => {
    const context = useHovercardProviderContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "HovercardAnchor must receive a `store` prop or be wrapped in a HovercardProvider component.",
    );

    const disabled = disabledFromProps(props);
    const showTimeoutRef = useRef(0);

    // Clear the show timeout if the anchor is unmounted
    useEffect(() => () => window.clearTimeout(showTimeoutRef.current), []);

    // Clear the show timeout if the mouse leaves the anchor element. We're
    // using the native mouseleave event instead of React's onMouseLeave so we
    // bypass the event.stopPropagation() logic set on the Hovercard component
    // for when the mouse is moving toward the Hovercard.
    useEffect(() => {
      const onMouseLeave = (event: MouseEvent) => {
        if (!store) return;
        const { anchorElement } = store.getState();
        if (!anchorElement) return;
        if (event.target !== anchorElement) return;
        window.clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = 0;
      };
      return addGlobalEventListener("mouseleave", onMouseLeave, true);
    }, [store]);

    const onMouseMoveProp = props.onMouseMove;
    const showOnHoverProp = useBooleanEvent(showOnHover);
    const isMouseMoving = useIsMouseMoving();

    const onMouseMove = useEvent(
      (event: ReactMouseEvent<HTMLAnchorElement>) => {
        onMouseMoveProp?.(event);
        if (disabled) return;
        if (!store) return;
        if (event.defaultPrevented) return;
        if (showTimeoutRef.current) return;
        if (!isMouseMoving()) return;
        if (!showOnHoverProp(event)) return;
        const element = event.currentTarget;
        store.setAnchorElement(element);
        store.setDisclosureElement(element);
        const { showTimeout, timeout } = store.getState();
        const showHovercard = () => {
          showTimeoutRef.current = 0;
          // Let's check again if the mouse is moving. This is to avoid showing
          // the hovercard on mobile clicks or after clicking on the anchor.
          if (!isMouseMoving()) return;
          store?.setAnchorElement(element);
          store?.show();
          queueMicrotask(() => {
            // We need to set the anchor element as the hovercard disclosure
            // element only when the hovercard is shown so it doesn't get
            // assigned an arbitrary element by the dialog component.
            store?.setDisclosureElement(element);
          });
        };
        const timeoutMs = showTimeout ?? timeout;
        if (timeoutMs === 0) {
          showHovercard();
        } else {
          showTimeoutRef.current = window.setTimeout(showHovercard, timeoutMs);
        }
      },
    );

    const ref = useCallback(
      (element: HTMLElement | null) => {
        if (!store) return;
        const { anchorElement } = store.getState();
        if (anchorElement?.isConnected) return;
        // We can set the anchor element only if it isn't already set or if it's
        // not linked to the DOM. This helps prevent the anchor element from
        // being reassigned to a different element when using multiple anchors
        // and new anchors are added to the DOM.
        store.setAnchorElement(element);
      },
      [store],
    );

    props = {
      ...props,
      ref: useMergeRefs(ref, props.ref),
      onMouseMove,
    };

    props = useFocusable(props);

    return props;
  },
);

/**
 * Renders an anchor element that will open a
 * [`Hovercard`](https://ariakit.org/reference/hovercard) popup on hover.
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx {2}
 * <HovercardProvider>
 *   <HovercardAnchor>@username</HovercardAnchor>
 *   <Hovercard>Details</Hovercard>
 * </HovercardProvider>
 * ```
 */
export const HovercardAnchor = forwardRef(function HovercardAnchor(
  props: HovercardAnchorProps,
) {
  const htmlProps = useHovercardAnchor(props);
  return createElement(TagName, htmlProps);
});

export interface HovercardAnchorOptions<T extends ElementType = TagName>
  extends FocusableOptions<T> {
  /**
   * Object returned by the
   * [`useHovercardStore`](https://ariakit.org/reference/use-hovercard-store)
   * hook. If not provided, the closest
   * [`HovercardProvider`](https://ariakit.org/reference/hovercard-provider)
   * component's context will be used.
   */
  store?: HovercardStore;
  /**
   * Shows the content element based on the user's _hover intent_ over the
   * anchor element. This behavior purposely ignores mobile touch and
   * unintentional mouse enter events, like those that happen during scrolling.
   *
   * Live examples:
   * - [Navigation Menubar](https://ariakit.org/examples/menubar-navigation)
   * - [Sliding Menu](https://ariakit.org/examples/menu-slide)
   * @default true
   */
  showOnHover?: BooleanOrCallback<ReactMouseEvent<HTMLElement>>;
}

export type HovercardAnchorProps<T extends ElementType = TagName> = Props<
  HovercardAnchorOptions<T>
>;
