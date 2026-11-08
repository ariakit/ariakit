import {
  useBooleanEvent,
  useEvent,
  useIsMouseMoving,
  useMergeRefs,
  createHook,
} from "@ariakit/react-utils";
import {
  addGlobalEventListener,
  disabledFromElement,
  disabledFromProps,
} from "@ariakit/utils";
import type { BooleanOrCallback } from "@ariakit/utils";
import type { ElementType, MouseEvent as ReactMouseEvent } from "react";
import { useCallback, useEffect, useRef } from "react";
import { trulyDisabledFromElement } from "../focusable/__utils.ts";
import type { FocusableOptions } from "../focusable/focusable.tsx";
import { useFocusable } from "../focusable/focusable.tsx";
import { addScrollHoverAnchor, isScrollHovered } from "./__scroll-hover.ts";
import type { HovercardStore } from "./hovercard-store.ts";

const TagName = "a" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

/**
 * Returns props that add hovercard trigger behavior to an element.
 * @see https://ariakit.com/components/hovercard
 */
export const useHovercardTrigger = createHook<TagName, HovercardTriggerOptions>(
  function useHovercardTrigger({
    store,
    showOnHover = true,
    hoverOnScroll = false,
    unstable_showOnHoverWhenDisabled: showOnHoverWhenDisabled = true,
    showOnScrollHover,
    setAnchorElement = false,
    ...props
  }) {
    const disabled = disabledFromProps(props);
    const focusable = props.focusable !== false;
    const triggerRef = useRef<HTMLElement | null>(null);
    const showTimeoutRef = useRef(0);

    // A truly disabled trigger must not reveal its content on hover, since that
    // content would be reachable by pointer users alone. Read it from the
    // element, because `render` composition can resolve the disabled state
    // below this hook. `focusable={false}` on this trigger's own props also
    // counts: it makes `accessibleWhenDisabled` inoperative and stops focus
    // from revealing anything, and an inactive Focusable below never stamps, so
    // only these props can say so. As an event function, this reads the latest
    // render's values even from a pending show timeout.
    // https://github.com/ariakit/ariakit/issues/7115
    // https://github.com/ariakit/ariakit/issues/7116
    const isTrulyDisabled = useEvent((element: Element) => {
      if (disabled && !focusable) return true;
      return trulyDisabledFromElement(element);
    });

    // Clear the show timeout when the trigger unmounts.
    useEffect(() => () => window.clearTimeout(showTimeoutRef.current), []);

    // Clear the show timeout if the mouse leaves the trigger element. We're
    // using the native mouseleave event instead of React's onMouseLeave so we
    // bypass the event.stopPropagation() logic set on the Hovercard component
    // for when the mouse is moving toward the Hovercard.
    useEffect(() => {
      const onMouseLeave = (event: MouseEvent) => {
        const trigger = triggerRef.current;
        if (!trigger) return;
        if (event.target !== trigger) return;
        window.clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = 0;
      };
      return addGlobalEventListener("mouseleave", onMouseLeave, true);
    }, []);

    const onMouseMoveProp = props.onMouseMove;
    const showOnHoverProp = useBooleanEvent(showOnHover);
    const showOnHoverWhenDisabledProp = useBooleanEvent(
      showOnHoverWhenDisabled,
    );
    const isMouseMoving = useIsMouseMoving();

    // Shows the hovercard for the hovered element after the show timeout.
    // `isHovering` checks again that the element is still hovered when the
    // timeout ends.
    const scheduleShow = useEvent(
      (element: HTMLElement, isHovering: () => boolean) => {
        if (setAnchorElement) {
          store.setAnchorElement(element);
        }
        store.setDisclosureElement(element);
        const { showTimeout, timeout } = store.getState();
        const showHovercard = () => {
          showTimeoutRef.current = 0;
          if (!isHovering()) return;
          // The trigger can lose its keyboard route while this timeout is
          // pending, and a stationary pointer doesn't reliably fire mouseleave
          // to cancel it, so the rule has to hold again here. Only this check
          // can be re-asked: the unstable_showOnHoverWhenDisabled callback
          // takes the mouse event, whose currentTarget React has nulled by now.
          if (isTrulyDisabled(element)) return;
          if (setAnchorElement) {
            store.setAnchorElement(element);
          }
          store.show();
          queueMicrotask(() => {
            // The dialog's open-time capture can still replace the trigger when
            // it's an element a dialog previously captured as a fallback. That
            // mark belongs to the element and is never dropped, so naming the
            // trigger above can't rescue it and this has to land after the
            // open.
            // https://github.com/ariakit/ariakit/issues/7087
            store.setDisclosureElement(element);
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

    const onMouseMove = useEvent((event: ReactMouseEvent<HTMLType>) => {
      onMouseMoveProp?.(event);
      if (event.defaultPrevented) return;
      if (showTimeoutRef.current) return;
      if (!isMouseMoving()) return;
      const element = event.currentTarget;
      if (isTrulyDisabled(element)) return;
      // Kept next to showOnHover so both callbacks see the same hover intent.
      if (disabled || disabledFromElement(element)) {
        if (!showOnHoverWhenDisabledProp(event)) return;
      }
      if (!showOnHoverProp(event)) return;
      // Let's check again if the mouse is moving when the timeout ends. This is
      // to avoid showing the hovercard on mobile clicks or after clicking on
      // the anchor.
      scheduleShow(element, isMouseMoving);
    });

    const mayHoverOnScroll = !!hoverOnScroll;
    const hoverOnScrollProp = useBooleanEvent(hoverOnScroll);

    // A scroll brought the trigger under the resting mouse.
    const onScrollHover = useEvent(() => {
      const element = triggerRef.current;
      if (!element) return;
      // Scrolls can move the pointer away and back before an earlier show
      // timeout of this trigger ends. The timeout starts again, so the
      // hovercard moves back to this trigger at once.
      window.clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = 0;
      if (isTrulyDisabled(element)) return;
      // These callbacks take a mouse event, which a scroll doesn't have, so
      // only their `false` values apply here.
      if (disabled || disabledFromElement(element)) {
        if (showOnHoverWhenDisabled === false) return;
      }
      if (showOnHover === false) return;
      if (showOnScrollHover && !showOnScrollHover(element)) return;
      scheduleShow(element, () => isScrollHovered(element));
    });

    useEffect(() => {
      if (!mayHoverOnScroll) return;
      return addScrollHoverAnchor({
        store,
        getElement: () => triggerRef.current,
        canHover: hoverOnScrollProp,
        hover: onScrollHover,
      });
    }, [mayHoverOnScroll, store, hoverOnScrollProp, onScrollHover]);

    const onClickProp = props.onClick;

    const onClick = useEvent((event: ReactMouseEvent<HTMLType>) => {
      onClickProp?.(event);
      // Resets showOnHover when the anchor is clicked so the consumer (for
      // example, TooltipAnchor) has the chance to prevent the hovercard from
      // showing on mousemove after a click.
      window.clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = 0;
    });

    const ref = useCallback(
      (element: HTMLElement | null) => {
        triggerRef.current = element;
        if (!setAnchorElement) return;
        const { anchorElement } = store.getState();
        if (anchorElement?.isConnected) return;
        // We can set the anchor element only if it isn't already set or if it's
        // not linked to the DOM. This helps prevent the anchor element from
        // being reassigned to a different element when using multiple anchors
        // and new anchors are added to the DOM.
        store.setAnchorElement(element);
      },
      [store, setAnchorElement],
    );

    props = {
      ...props,
      ref: useMergeRefs(ref, props.ref),
      onMouseMove,
      onClick,
    };

    props = useFocusable<TagName>(props);

    return props;
  },
);

export interface HovercardTriggerOptions<
  T extends ElementType = TagName,
> extends FocusableOptions<T> {
  /**
   * Object returned by the
   * [`useHovercardStore`](https://ariakit.com/reference/use-hovercard-store)
   * hook.
   */
  store: HovercardStore;
  /**
   * Shows the content element based on the user's _hover intent_ over the
   * trigger element. This behavior purposely ignores mobile touch and
   * unintentional mouse enter events, like those that happen during scrolling.
   *
   * Live examples:
   * - [Navigation Menubar](https://ariakit.com/examples/menubar-navigation)
   * - [Sliding Menu](https://ariakit.com/examples/menu-slide)
   * @default true
   */
  showOnHover?: BooleanOrCallback<ReactMouseEvent<HTMLElement>>;
  /**
   * Whether a scroll that moves this anchor under a resting mouse pointer
   * counts as hovering it. The content element then shows after the show
   * timeout, or, when it's already open for another anchor of the same store,
   * moves to this anchor at once. While this anchor is the current one, a
   * scroll that leaves the pointer outside the anchor and the content element
   * hides the content element after the hide timeout, like a mouse leave. The
   * [`hideOnHoverOutside`](https://ariakit.com/reference/hovercard#hideonhoveroutside)
   * callback then receives a `mousemove` event that isn't dispatched and has
   * only the pointer coordinates.
   *
   * Only a mouse pointer counts, and only after it moves. A press, or a key
   * press other than a modifier key such as Shift, stops scrolls from counting
   * until the mouse moves again. Scrolls by script count too.
   *
   * This can be either a boolean or a callback receiving the scroll event. The
   * callback should return a boolean. For example, check `event.target` to
   * count only the scrolls of a sidebar.
   *
   * Setting
   * [`showOnHover`](https://ariakit.com/reference/hovercard-anchor#showonhover)
   * to `false` also stops scrolls from showing the content element, but a
   * `showOnHover` callback doesn't run on a scroll. Hiding still follows
   * [`hideOnHoverOutside`](https://ariakit.com/reference/hovercard#hideonhoveroutside),
   * like a mouse leave.
   * @default false
   */
  hoverOnScroll?: BooleanOrCallback<Event>;
  /**
   * Whether hovering can show the content element while the trigger element is
   * disabled. Set this to `false` when revealing the content counts as
   * activating the trigger rather than explaining it. An element that declares
   * `aria-disabled` or `disabled` on its own, outside Ariakit props, counts as
   * disabled here too. A disabled trigger that isn't `accessibleWhenDisabled`
   * never shows the content on hover, since the content would then be reachable
   * by pointer users alone; this prop can't turn that back on.
   * @default true
   * @deprecated
   * @private
   */
  unstable_showOnHoverWhenDisabled?: BooleanOrCallback<
    ReactMouseEvent<HTMLElement>
  >;
  setAnchorElement?: boolean;
  /**
   * Called when a scroll moves the trigger under the resting mouse pointer and
   * the scroll counts as hover. Returning `false` skips the show timeout.
   */
  showOnScrollHover?: (element: HTMLElement) => boolean;
}
