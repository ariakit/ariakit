import { FocusEvent, useCallback, useEffect, useRef, useState } from "react";
import { contains } from "ariakit-utils/dom";
import { addGlobalEventListener } from "ariakit-utils/events";
import { hasFocusWithin } from "ariakit-utils/focus";
import {
  useBooleanEventCallback,
  useEventCallback,
  useForkRef,
} from "ariakit-utils/hooks";
import { chain } from "ariakit-utils/misc";
import {
  createComponent,
  createElement,
  createHook,
} from "ariakit-utils/system";
import { As, BooleanOrCallback, Props } from "ariakit-utils/types";
import { PopoverOptions, usePopover } from "../popover/popover";
import {
  Point,
  getElementPolygon,
  getEventPoint,
  isPointInPolygon,
} from "./__utils";
import { HovercardState } from "./hovercard-state";

function getAnchorElement(anchorRef: HovercardState["anchorRef"]) {
  // The anchor element can be a VirtualElement, which is just an object with a
  // getBoundingClientRect() method. Although this is not really valid in the
  // context of a hovercard, we need to make sure to get the actual element.
  if (anchorRef.current && "tagName" in anchorRef.current) {
    return anchorRef.current;
  }
  return null;
}

function isMovingThroughHovercardElements(
  target: Node | null,
  card: HTMLElement,
  anchor: HTMLElement | null
) {
  // The hovercard element has focus so we should keep it visible.
  if (hasFocusWithin(card)) return true;
  if (!target) return false;
  if (contains(card, target)) return true;
  if (anchor && contains(anchor, target)) return true;
  return false;
}

// The autoFocusOnShow will be set to true when the hovercard disclosure element
// is clicked. We have to reset it to false when the hovercard element gets
// hidden or is unmounted.
function useAutoFocusOnShow({ state, ...props }: HovercardProps) {
  // Resets autoFocusOnShow
  useEffect(() => {
    if (!state.visible) {
      state.setAutoFocusOnShow(false);
    }
  }, [state.visible, state.setAutoFocusOnShow]);

  // Resets on unmount as well
  useEffect(
    () => () => state.setAutoFocusOnShow(false),
    [state.setAutoFocusOnShow]
  );

  return {
    autoFocusOnShow: !!props.modal || state.autoFocusOnShow,
    ...props,
  };
}

// When the hovercard element has focus, we should move focus back to the anchor
// element when the hovercard gets hidden (or unmounted).
function useAutoFocusOnHide({ state, ...props }: HovercardProps) {
  const [autoFocusOnHide, setAutoFocusOnHide] = useState(false);
  const finalFocusRef = useRef<HTMLElement | null>(null);
  const onFocusProp = useEventCallback(props.onFocus);

  // Resets autoFocusOnHide
  useEffect(() => {
    if (!state.mounted) {
      setAutoFocusOnHide(false);
    }
  }, [state.mounted]);

  // Sets finalFocusRef
  useEffect(() => {
    finalFocusRef.current = getAnchorElement(state.anchorRef);
  }, [state.anchorRef]);

  const onFocus = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      onFocusProp(event);
      if (event.defaultPrevented) return;
      setAutoFocusOnHide(true);
    },
    [onFocusProp]
  );

  props = {
    autoFocusOnHide,
    finalFocusRef,
    ...props,
    onFocus,
  };

  return props;
}

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render a hovercard element, which is a popover that's
 * usually made visible by hovering the mouse cursor over an anchor element
 * (`HovercardAnchor`).
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx
 * const state = useHovercardState();
 * const props = useHovercard({ state });
 * <HovercardAnchor state={state}>@username</HovercardAnchor>
 * <Role {...props}>Details</Role>
 * ```
 */
export const useHovercard = createHook<HovercardOptions>(
  ({
    state,
    portal = false,
    hideOnMouseLeave = true,
    hideOnEscape = true,
    hideOnControl = false,
    ...props
  }) => {
    const ref = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef(0);
    const enterPointRef = useRef<Point | null>(null);
    const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);
    const portalRef = useForkRef(setPortalNode, props.portalRef);
    const domReady = !portal || portalNode;

    const hideOnEscapeProp = useBooleanEventCallback(hideOnEscape);
    const hideOnControlProp = useBooleanEventCallback(hideOnControl);

    // Hide on Escape/Control. Popover already handles this, but only when the
    // dialog, the backdrop or the disclosure elements are focused. Since the
    // hovercard, by default, does not receive focus when it's shown, we need to
    // handle this globally here.
    useEffect(() => {
      if (!state.visible) return;
      return addGlobalEventListener("keydown", (event) => {
        if (event.defaultPrevented) return;
        const isEscape = event.key === "Escape" && hideOnEscapeProp(event);
        const isControl = event.key === "Control" && hideOnControlProp(event);
        if (isEscape || isControl) {
          state.hide();
        }
      });
    }, [state.visible, hideOnEscapeProp, hideOnControlProp, state.hide]);

    // Checks whether the mouse is moving toward the hovercard. If not, hide the
    // card after a short delay (hideTimeout).
    useEffect(() => {
      if (!hideOnMouseLeave) return;
      if (!domReady) return;
      if (!state.mounted) return;
      const element = ref.current;
      if (!element) return;
      const onMouseMove = (event: MouseEvent) => {
        const enterPoint = enterPointRef.current;
        const target = event.target as Node | null;
        const anchor = getAnchorElement(state.anchorRef);
        // Checks whether the hovercard element has focus or the mouse is moving
        // through valid hovercard elements.
        if (isMovingThroughHovercardElements(target, element, anchor)) {
          // While the mouse is moving over the anchor element while the hover
          // card is visible, keep track of the mouse position so we'll use the
          // last point before the mouse leaves the anchor element.
          enterPointRef.current =
            target && anchor && contains(anchor, target)
              ? getEventPoint(event)
              : null;
          window.clearTimeout(timeoutRef.current);
          timeoutRef.current = 0;
          return;
        }
        if (timeoutRef.current) return;
        if (enterPoint) {
          const currentPoint = getEventPoint(event);
          const placement = state.currentPlacement;
          const elementPolygon = getElementPolygon(element, placement);
          const polygon = [enterPoint, ...elementPolygon];
          // If the current's event mouse position is inside the transit
          // triangle area, this means that the mouse is moving toward the hover
          // card.
          if (isPointInPolygon(currentPoint, polygon)) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }
        }
        // Otherwise, hide the hovercard after a short delay (hideTimeout).
        timeoutRef.current = window.setTimeout(state.hide, state.hideTimeout);
      };
      return addGlobalEventListener("mousemove", onMouseMove, true);
    }, [
      hideOnMouseLeave,
      domReady,
      state.mounted,
      state.currentPlacement,
      state.hide,
      state.hideTimeout,
    ]);

    // Disable mouse events while the mouse is moving toward the hovercard. This
    // is necessary because these events may trigger focus on other elements and
    // close the hovercard while the user is moving the mouse toward it.
    useEffect(() => {
      if (!hideOnMouseLeave) return;
      if (!domReady) return;
      if (!state.mounted) return;
      const element = ref.current;
      if (!element) return;
      const disableEvent = (event: MouseEvent) => {
        const enterPoint = enterPointRef.current;
        if (!enterPoint) return;
        const placement = state.currentPlacement;
        const elementPolygon = getElementPolygon(element, placement);
        const polygon = [enterPoint, ...elementPolygon];
        if (isPointInPolygon(getEventPoint(event), polygon)) {
          event.preventDefault();
          event.stopPropagation();
        }
      };
      return chain(
        // Note: we may need to add pointer events here in the future.
        addGlobalEventListener("mouseenter", disableEvent, true),
        addGlobalEventListener("mouseover", disableEvent, true),
        addGlobalEventListener("mouseout", disableEvent, true),
        addGlobalEventListener("mouseleave", disableEvent, true)
      );
    }, [hideOnMouseLeave, domReady, state.mounted, state.currentPlacement]);

    props = {
      ...props,
      ref: useForkRef(ref, props.ref),
    };

    props = useAutoFocusOnHide({ state, ...props });
    props = useAutoFocusOnShow({ state, ...props });

    props = usePopover({
      hideOnEscape,
      state,
      portal,
      ...props,
      portalRef,
    });

    return props;
  }
);

/**
 * A component that renders a hovercard element, which is a popover that's
 * usually made visible by hovering the mouse cursor over an anchor element
 * (`HovercardAnchor`).
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx
 * const hovercard = useHovercardState();
 * <HovercardAnchor state={hovercard}>@username</HovercardAnchor>
 * <Hovercard state={hovercard}>Details</Hovercard>
 * ```
 */
export const Hovercard = createComponent<HovercardOptions>((props) => {
  const htmlProps = useHovercard(props);
  return createElement("div", htmlProps);
});

export type HovercardOptions<T extends As = "div"> = Omit<
  PopoverOptions<T>,
  "state"
> & {
  /**
   * Object returned by the `useHovercardState` hook.
   */
  state: HovercardState;
  /**
   * Determines whether the popover will be hidden when the user presses the
   * Control key. This has been proposed as an alternative to the Escape key,
   * which may introduce some issues, especially when popovers are used within
   * dialogs that also hide on Escape. See
   * https://github.com/w3c/aria-practices/issues/1506
   * @default false
   */
  hideOnControl?: BooleanOrCallback<KeyboardEvent>;
  /**
   * Whether to hide the popover when the mouse cursor leaves any hovercard
   * element, including the hovercard popover itself, but also the anchor
   * element.
   * @default true
   */
  hideOnMouseLeave?: boolean;
};

export type HovercardProps<T extends As = "div"> = Props<HovercardOptions<T>>;
