import type { FocusEvent } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { contains } from "@ariakit/core/utils/dom";
import { addGlobalEventListener } from "@ariakit/core/utils/events";
import { hasFocusWithin } from "@ariakit/core/utils/focus";
import { chain, isFalsyBooleanCallback } from "@ariakit/core/utils/misc";
import { sync } from "@ariakit/core/utils/store";
import type { BooleanOrCallback } from "@ariakit/core/utils/types";
import type { PopoverOptions } from "../popover/popover.js";
import { usePopover } from "../popover/popover.js";
import {
  useBooleanEvent,
  useEvent,
  useLiveRef,
  useMergeRefs,
  usePortalRef,
  useSafeLayoutEffect,
  useWrapElement,
} from "../utils/hooks.js";
import { createComponent, createElement, createHook } from "../utils/system.js";
import type { As, Props } from "../utils/types.js";
import type { HovercardStore } from "./hovercard-store.js";
import type { Point } from "./utils/polygon.js";
import {
  getElementPolygon,
  getEventPoint,
  isPointInPolygon,
} from "./utils/polygon.js";

function isMovingOnHovercard(
  target: Node | null,
  card: HTMLElement,
  anchor: HTMLElement | null,
  nested?: HTMLElement[],
) {
  // The hovercard element has focus so we should keep it visible.
  if (hasFocusWithin(card)) return true;
  if (!target) return false;
  // The mouse is moving on an element inside the hovercard.
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
function useAutoFocusOnShow({ store, ...props }: HovercardProps) {
  const open = store.useState("open");
  const openRef = useLiveRef(open);

  // Resets autoFocusOnShow
  useEffect(() => {
    if (!open) {
      store.setAutoFocusOnShow(false);
    }
  }, [open, store]);

  // On unmount as well.
  useEffect(
    () => () => {
      if (!openRef.current) {
        store.setAutoFocusOnShow(false);
      }
    },
    [store],
  );

  // If the hovercard is modal, we should always autoFocus on show.
  const modal = !!props.modal;
  const autoFocusOnShow = store.useState(
    (state) => modal || state.autoFocusOnShow,
  );

  return { autoFocusOnShow, ...props };
}

// When the hovercard element has focus, we should move focus back to the anchor
// element when the hovercard gets hidden (or unmounted).
function useAutoFocusOnHide({ store, ...props }: HovercardProps) {
  const [autoFocusOnHide, setAutoFocusOnHide] = useState(false);
  const mounted = store.useState("mounted");

  // Resets autoFocusOnHide
  useEffect(() => {
    if (!mounted) {
      setAutoFocusOnHide(false);
    }
  }, [mounted]);

  const onFocusProp = props.onFocus;

  const onFocus = useEvent((event: FocusEvent<HTMLDivElement>) => {
    onFocusProp?.(event);
    if (event.defaultPrevented) return;
    setAutoFocusOnHide(true);
  });

  // TODO: Maybe use state.anchorElement directly?
  const finalFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    return sync(
      store,
      (state) => {
        finalFocusRef.current = state.anchorElement;
      },
      ["anchorElement"],
    );
  }, []);

  props = {
    autoFocusOnHide,
    finalFocus: finalFocusRef,
    ...props,
    onFocus,
  };

  return props;
}

const NestedHovercardContext = createContext<
  ((element: HTMLElement) => () => void) | null
>(null);

/**
 * Returns props to create a `Hovercard` component.
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx
 * const store = useHovercardStore();
 * const props = useHovercard({ store });
 * <HovercardAnchor store={store}>@username</HovercardAnchor>
 * <Role {...props}>Details</Role>
 * ```
 */
export const useHovercard = createHook<HovercardOptions>(
  ({
    store,
    modal = false,
    portal = !!modal,
    hideOnEscape = true,
    hideOnHoverOutside = true,
    disablePointerEventsOnApproach = !!hideOnHoverOutside,
    ...props
  }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [nestedHovercards, setNestedHovercards] = useState<HTMLElement[]>([]);
    const hideTimeoutRef = useRef(0);
    const enterPointRef = useRef<Point | null>(null);
    const { portalRef, domReady } = usePortalRef(portal, props.portalRef);

    const mayHideOnHoverOutside = !!hideOnHoverOutside;
    const hideOnHoverOutsideProp = useBooleanEvent(hideOnHoverOutside);
    const mayDisablePointerEvents = !!disablePointerEventsOnApproach;
    const disablePointerEventsProp = useBooleanEvent(
      disablePointerEventsOnApproach,
    );

    const mounted = store.useState("mounted");

    // Checks whether the mouse is moving toward the hovercard. If not, hide the
    // card after a short delay (hideTimeout).
    useEffect(() => {
      if (!domReady) return;
      if (!mounted) return;
      if (!mayHideOnHoverOutside && !mayDisablePointerEvents) return;
      const element = ref.current;
      if (!element) return;
      const onMouseMove = (event: MouseEvent) => {
        const { anchorElement, hideTimeout, timeout } = store.getState();
        const enterPoint = enterPointRef.current;
        const target = event.target as Node | null;
        const anchor = anchorElement;
        // Checks whether the hovercard element has focus or the mouse is moving
        // through valid hovercard elements.
        if (isMovingOnHovercard(target, element, anchor, nestedHovercards)) {
          // While the mouse is moving over the anchor element while the hover
          // card is open, keep track of the mouse position so we can use the
          // last point before the mouse leaves the anchor element.
          enterPointRef.current =
            target && anchor && contains(anchor, target)
              ? getEventPoint(event)
              : null;
          window.clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = 0;
          return;
        }
        // If there's already a scheduled timeout to hide the hovercard, we do
        // nothing.
        if (hideTimeoutRef.current) return;
        // Enter point will be null when the user hovers over the hovercard
        // element.
        if (enterPoint) {
          const currentPoint = getEventPoint(event);
          const polygon = getElementPolygon(element, enterPoint);
          // If the current event's mouse position is inside the transit
          // polygon, this means that the mouse is moving toward the hover card,
          // so we disable this event. This is necessary because the mousemove
          // event may trigger focus on other elements and close the hovercard.
          if (isPointInPolygon(currentPoint, polygon)) {
            // Refreshes the enter point.
            enterPointRef.current = currentPoint;
            if (!disablePointerEventsProp(event)) return;
            event.preventDefault();
            event.stopPropagation();
            return;
          }
        }
        if (!hideOnHoverOutsideProp(event)) return;
        // Otherwise, hide the hovercard after a short delay (hideTimeout).
        hideTimeoutRef.current = window.setTimeout(() => {
          hideTimeoutRef.current = 0;
          store.hide();
        }, hideTimeout ?? timeout);
      };
      return chain(addGlobalEventListener("mousemove", onMouseMove, true), () =>
        clearTimeout(hideTimeoutRef.current),
      );
    }, [
      store,
      domReady,
      mounted,
      mayHideOnHoverOutside,
      mayDisablePointerEvents,
      nestedHovercards,
      disablePointerEventsProp,
      hideOnHoverOutsideProp,
    ]);

    // Disable mouse events while the mouse is moving toward the hovercard. This
    // is necessary because these events may trigger focus on other elements and
    // close the hovercard while the user is moving the mouse toward it.
    useEffect(() => {
      if (!domReady) return;
      if (!mounted) return;
      if (!mayDisablePointerEvents) return;
      const disableEvent = (event: MouseEvent) => {
        const element = ref.current;
        if (!element) return;
        const enterPoint = enterPointRef.current;
        if (!enterPoint) return;
        const polygon = getElementPolygon(element, enterPoint);
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
        addGlobalEventListener("mouseleave", disableEvent, true),
      );
    }, [domReady, mounted, mayDisablePointerEvents, disablePointerEventsProp]);

    const registerOnParent = useContext(NestedHovercardContext);

    // Register the hovercard as a nested hovercard on the parent hovercard if
    // it's not a modal, is portal and is mounted. We don't need to register
    // non-portal hovercards because they will be captured by the contains
    // function in the isMovingOnHovercard function above. This must be a layout
    // effect so we don't lose mouse move events right after the nested
    // hovercard has been mounted (for example, a submenu that's overlapping its
    // menu button and we keep moving the mouse while the submenu is due to
    // open).
    useSafeLayoutEffect(() => {
      if (modal) return;
      if (!portal) return;
      if (!mounted) return;
      if (!domReady) return;
      const element = ref.current;
      if (!element) return;
      return registerOnParent?.(element);
    }, [modal, portal, mounted, domReady]);

    const registerNestedHovercard = useCallback(
      (element: any) => {
        setNestedHovercards((prevElements) => [...prevElements, element]);
        const parentUnregister = registerOnParent?.(element);
        return () => {
          setNestedHovercards((prevElements) =>
            prevElements.filter((item) => item !== element),
          );
          parentUnregister?.();
        };
      },
      [registerOnParent],
    );

    props = useWrapElement(
      props,
      (element) => (
        <NestedHovercardContext.Provider value={registerNestedHovercard}>
          {element}
        </NestedHovercardContext.Provider>
      ),
      [registerNestedHovercard],
    );

    props = {
      ...props,
      ref: useMergeRefs(ref, props.ref),
    };

    props = useAutoFocusOnHide({ store, ...props });
    props = useAutoFocusOnShow({ store, modal, ...props });

    props = usePopover({
      store,
      modal,
      portal,
      ...props,
      portalRef,
      hideOnEscape(event) {
        if (isFalsyBooleanCallback(hideOnEscape, event)) return false;
        // Hide again on the next frame to avoid the popover being shown again
        // when the user presses the escape key and trigger focusVisible on the
        // anchor element (which is the case of tooltip anchor).
        requestAnimationFrame(() => requestAnimationFrame(store.hide));
        return true;
      },
    });

    return props;
  },
);

/**
 * Renders a hovercard element, which is a popover that's usually made visible
 * by hovering the mouse cursor over an anchor element (`HovercardAnchor`).
 * @see https://ariakit.org/components/hovercard
 * @example
 * ```jsx
 * const hovercard = useHovercardStore();
 * <HovercardAnchor store={hovercard}>@username</HovercardAnchor>
 * <Hovercard store={hovercard}>Details</Hovercard>
 * ```
 */
export const Hovercard = createComponent<HovercardOptions>((props) => {
  const htmlProps = useHovercard(props);
  return createElement("div", htmlProps);
});

if (process.env.NODE_ENV !== "production") {
  Hovercard.displayName = "Hovercard";
}

export interface HovercardOptions<T extends As = "div">
  extends PopoverOptions<T> {
  /**
   * Object returned by the `useHovercardStore` hook.
   */
  store: HovercardStore;
  /**
   * Whether to hide the popover when the mouse cursor leaves any hovercard
   * element, including the hovercard popover itself, but also the anchor
   * element.
   * @default true
   */
  hideOnHoverOutside?: BooleanOrCallback<MouseEvent>;
  /**
   * Whether to disable the pointer events outside of the hovercard while the
   * mouse is moving toward the hovercard. This is necessary because these
   * events may trigger focus on other elements and close the hovercard while
   * the user is moving the mouse toward it.
   * @default true
   */
  disablePointerEventsOnApproach?: BooleanOrCallback<MouseEvent>;
  /**
   * @default false
   */
  modal?: PopoverOptions<T>["modal"];
}

export type HovercardProps<T extends As = "div"> = Props<HovercardOptions<T>>;
