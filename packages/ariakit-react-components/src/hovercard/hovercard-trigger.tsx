import {
  useBooleanEvent,
  useEvent,
  useIsMouseMoving,
  useMergeRefs,
  createHook,
} from "@ariakit/react-utils";
import { addGlobalEventListener, disabledFromProps } from "@ariakit/utils";
import type { BooleanOrCallback } from "@ariakit/utils";
import type { ElementType, MouseEvent as ReactMouseEvent } from "react";
import { useCallback, useEffect, useRef } from "react";
import type { FocusableOptions } from "../focusable/focusable.tsx";
import { useFocusable } from "../focusable/focusable.tsx";
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
    unstable__positioningAnchor = false,
    ...props
  }) {
    const disabled = disabledFromProps(props);
    const triggerRef = useRef<HTMLElement | null>(null);
    const showTimeoutRef = useRef(0);

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
    const isMouseMoving = useIsMouseMoving();

    const onMouseMove = useEvent((event: ReactMouseEvent<HTMLType>) => {
      onMouseMoveProp?.(event);
      if (disabled) return;
      if (event.defaultPrevented) return;
      if (showTimeoutRef.current) return;
      if (!isMouseMoving()) return;
      if (!showOnHoverProp(event)) return;
      const element = event.currentTarget;
      if (unstable__positioningAnchor) {
        store.setAnchorElement(element);
      }
      store.setDisclosureElement(element);
      const { showTimeout, timeout } = store.getState();
      const showHovercard = () => {
        showTimeoutRef.current = 0;
        if (triggerRef.current !== element) return;
        // Let's check again if the mouse is moving. This is to avoid showing
        // the hovercard on mobile clicks or after clicking on the anchor.
        if (!isMouseMoving()) return;
        if (unstable__positioningAnchor) {
          store.setAnchorElement(element);
        }
        store.show();
        queueMicrotask(() => {
          if (triggerRef.current !== element) return;
          // We need to set the trigger as the hovercard disclosure only when the
          // hovercard is shown so it isn't replaced by the dialog component.
          store.setDisclosureElement(element);
        });
      };
      const timeoutMs = showTimeout ?? timeout;
      if (timeoutMs === 0) {
        showHovercard();
      } else {
        showTimeoutRef.current = window.setTimeout(showHovercard, timeoutMs);
      }
    });

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
        const previousElement = triggerRef.current;
        triggerRef.current = element;
        const { anchorElement, disclosureElement } = store.getState();
        if (!element && disclosureElement === previousElement) {
          store.setDisclosureElement(null);
        }
        if (!unstable__positioningAnchor) return;
        if (!element && anchorElement !== previousElement) return;
        if (element && anchorElement?.isConnected) return;
        // Preserve a connected anchor when new anchors are added to the DOM.
        store.setAnchorElement(element);
      },
      [store, unstable__positioningAnchor],
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
   * Determines whether the trigger also owns the store's positioning anchor.
   * `HovercardAnchor` enables this, whereas composed triggers such as
   * `MenuButton` leave it disabled so a separate anchor takes precedence.
   * @private
   */
  unstable__positioningAnchor?: boolean;
}
