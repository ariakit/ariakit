import {
  FocusEvent,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { contains } from "ariakit-utils/dom";
import { addGlobalEventListener } from "ariakit-utils/events";
import { hasFocusWithin } from "ariakit-utils/focus";
import {
  useBooleanEventCallback,
  useEventCallback,
  useForkRef,
  useWrapElement,
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
} from "./__utils/polygon";
import { HovercardState } from "./hovercard-state";

function isMovingOnHovercard(
  target: Node | null,
  card: HTMLElement,
  anchor: HTMLElement | null,
  nested?: HTMLElement[]
) {
  // The hovercard element has focus so we should keep it visible.
  if (hasFocusWithin(card)) return true;
  // The mouse is moving on an element inside the hovercard.
  if (!target) return false;
  if (contains(card, target)) return true;
  // The mouse is moving on an element inside the anchor element.
  if (anchor && contains(anchor, target)) return true;
  // The mouse is moving on an element inside a nested hovercard.
  if (nested?.some((card) => isMovingOnHovercard(target, card, anchor))) {
    return true;
  }
  return false;
}

// The autoFocusOnShow state will be set to true when the hovercard disclosure
// element is clicked. We have to reset it to false when the hovercard element
// gets hidden or is unmounted.
function useAutoFocusOnShow({ state, ...props }: HovercardProps) {
  // Resets autoFocusOnShow
  useEffect(() => {
    if (!state.mounted) {
      state.setAutoFocusOnShow(false);
    }
  }, [state.mounted, state.setAutoFocusOnShow]);

  // Resets on unmount as well
  useEffect(
    () => () => state.setAutoFocusOnShow(false),
    [state.setAutoFocusOnShow]
  );

  return {
    // If the hovercard is modal, we should always autoFocus on show.
    autoFocusOnShow: !!props.modal || state.autoFocusOnShow,
    ...props,
  };
}

// When the hovercard element has focus, we should move focus back to the anchor
// element when the hovercard gets hidden (or unmounted).
function useAutoFocusOnHide({ state, ...props }: HovercardProps) {
  const [autoFocusOnHide, setAutoFocusOnHide] = useState(false);

  // Resets autoFocusOnHide
  useEffect(() => {
    if (!state.mounted) {
      setAutoFocusOnHide(false);
    }
  }, [state.mounted]);

  const onFocusProp = useEventCallback(props.onFocus);

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
    finalFocusRef: state.anchorRef,
    ...props,
    onFocus,
  };

  return props;
}

const NestedHovercardContext = createContext<
  ((element: HTMLElement) => () => void) | null
>(null);

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
    modal = false,
    portal = !!modal,
    hideOnEscape = true,
    hideOnControl = false,
    hideOnHoverOutside = true,
    disablePointerEventsOnApproach = !!hideOnHoverOutside,
    ...props
  }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [nestedHovercards, setNestedHovercards] = useState<HTMLElement[]>([]);
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

    const mayHideOnHoverOutside = !!hideOnHoverOutside;
    const hideOnHoverOutsideProp = useBooleanEventCallback(hideOnHoverOutside);
    const mayDisablePointerEvents = !!disablePointerEventsOnApproach;
    const disablePointerEventsProp = useBooleanEventCallback(
      disablePointerEventsOnApproach
    );

    // Checks whether the mouse is moving toward the hovercard. If not, hide the
    // card after a short delay (hideTimeout).
    useEffect(() => {
      if (!domReady) return;
      if (!state.mounted) return;
      if (!mayHideOnHoverOutside && !mayDisablePointerEvents) return;
      const element = ref.current;
      if (!element) return;
      const onMouseMove = (event: MouseEvent) => {
        const enterPoint = enterPointRef.current;
        const target = event.target as Node | null;
        const anchor = state.anchorRef.current;
        // Checks whether the hovercard element has focus or the mouse is moving
        // through valid hovercard elements.
        if (isMovingOnHovercard(target, element, anchor, nestedHovercards)) {
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
        // If there's already a scheduled timeout to hide the hovercard, we do
        // nothing.
        if (timeoutRef.current) return;
        // Enter point will be null when the user hovers over the hovercard
        // element.
        if (enterPoint) {
          const currentPoint = getEventPoint(event);
          const placement = state.currentPlacement;
          const elementPolygon = getElementPolygon(element, placement);
          const polygon = [enterPoint, ...elementPolygon];
          // If the current's event mouse position is inside the transit
          // polygon, this means that the mouse is moving toward the hover card,
          // so we disable this event. This is necessary because the mousemove
          // event may trigger focus on other elements and close the hovercard.
          if (isPointInPolygon(currentPoint, polygon)) {
            if (!disablePointerEventsProp(event)) return;
            event.preventDefault();
            event.stopPropagation();
            return;
          }
        }
        if (!hideOnHoverOutsideProp(event)) return;
        // Otherwise, hide the hovercard after a short delay (hideTimeout).
        timeoutRef.current = window.setTimeout(state.hide, state.hideTimeout);
      };
      return addGlobalEventListener("mousemove", onMouseMove, true);
    }, [
      domReady,
      state.mounted,
      mayHideOnHoverOutside,
      mayDisablePointerEvents,
      state.anchorRef,
      nestedHovercards,
      state.currentPlacement,
      disablePointerEventsProp,
      hideOnHoverOutsideProp,
      state.hide,
      state.hideTimeout,
    ]);

    // Disable mouse events while the mouse is moving toward the hovercard. This
    // is necessary because these events may trigger focus on other elements and
    // close the hovercard while the user is moving the mouse toward it.
    useEffect(() => {
      if (!domReady) return;
      if (!state.mounted) return;
      if (!mayDisablePointerEvents) return;
      const element = ref.current;
      if (!element) return;
      const disableEvent = (event: MouseEvent) => {
        const enterPoint = enterPointRef.current;
        if (!enterPoint) return;
        const placement = state.currentPlacement;
        const elementPolygon = getElementPolygon(element, placement);
        const polygon = [enterPoint, ...elementPolygon];
        if (isPointInPolygon(getEventPoint(event), polygon)) {
          if (!disablePointerEventsProp(event)) return;
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
    }, [
      domReady,
      state.mounted,
      mayDisablePointerEvents,
      state.currentPlacement,
      disablePointerEventsProp,
    ]);

    const registerOnParent = useContext(NestedHovercardContext);

    // Register the hovercard as a nested hovercard on the parent hovercard if
    // if it's not a modal, is portal and is mounted. We don't need to register
    // non-portal hovercards because they will be captured by contains in the
    // isMovingOnHovercard function above.
    useEffect(() => {
      if (modal) return;
      if (!portal) return;
      if (!state.mounted) return;
      if (!domReady) return;
      const element = ref.current;
      if (!element) return;
      return registerOnParent?.(element);
    }, [modal, portal, state.mounted, domReady]);

    const registerNestedHovercard = useCallback(
      (element: any) => {
        setNestedHovercards((prevElements) => [...prevElements, element]);
        const parentUnregister = registerOnParent?.(element);
        return () => {
          setNestedHovercards((prevElements) =>
            prevElements.filter((item) => item !== element)
          );
          parentUnregister?.();
        };
      },
      [registerOnParent]
    );

    props = useWrapElement(
      props,
      (element) => (
        <NestedHovercardContext.Provider value={registerNestedHovercard}>
          {element}
        </NestedHovercardContext.Provider>
      ),
      [registerNestedHovercard]
    );

    props = {
      ...props,
      ref: useForkRef(ref, props.ref),
    };

    props = useAutoFocusOnHide({ state, ...props });
    props = useAutoFocusOnShow({ state, ...props });

    props = usePopover({
      hideOnEscape,
      state,
      modal,
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
  hideOnHoverOutside?: BooleanOrCallback<MouseEvent>;
  /**
   * Whether to disable the pointer events outside of the hovercard while
   * the mouse is moving toward the hovercard. This is necessary because these
   * events may trigger focus on other elements and close the hovercard while
   * the user is moving the mouse toward it.
   * @default true
   */
  disablePointerEventsOnApproach?: BooleanOrCallback<MouseEvent>;
};

export type HovercardProps<T extends As = "div"> = Props<HovercardOptions<T>>;
