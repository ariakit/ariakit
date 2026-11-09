import { useStoreState } from "@ariakit/react-store";
import {
  useBooleanEvent,
  useEvent,
  useIsMouseMoving,
  useLiveRef,
  useMergeRefs,
  usePortalRef,
  useSafeLayoutEffect,
  useWrapElement,
  createElement,
  createHook,
  forwardRef,
} from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
import { sync } from "@ariakit/store";
import {
  addGlobalEventListener,
  contains,
  getActiveElement,
  getDocument,
  getWindow,
  hasFocusWithin,
  chain,
  invariant,
} from "@ariakit/utils";
import type { BooleanOrCallback } from "@ariakit/utils";
import type { ElementType, FocusEvent, RefObject } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createDialogComponent } from "../dialog/dialog.tsx";
import { useEscapeClose } from "../dialog/utils/__use-escape-close.ts";
import type { PopoverOptions } from "../popover/popover.tsx";
import { usePopover } from "../popover/popover.tsx";
import type { ScrollHoverListener } from "./__scroll-hover.ts";
import {
  addScrollHoverListener,
  getScrollHoverAnchor,
} from "./__scroll-hover.ts";
import {
  HovercardScopedContextProvider,
  useHovercardProviderContext,
} from "./hovercard-context.tsx";
import type { HovercardStore } from "./hovercard-store.ts";
import type { Point } from "./utils/polygon.ts";
import {
  getElementPolygon,
  getEventPoint,
  isPointInPolygon,
} from "./utils/polygon.ts";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

// Whether the window is the one of a frame inside the element, or of a frame
// nested in one. A page can hide its own frameElement, so this finds the frame
// by its window.
function isFrameWindowInside(element: Element, view: Window) {
  const elementWindow = getWindow(element);
  if (view === elementWindow) return false;
  // The window of the frame in the element's document that holds the view.
  let frameWindow = view;
  let parent = frameWindow.parent;
  while (parent !== elementWindow) {
    // A removed frame's window has no parent, and the top window is its own.
    if (!parent) return false;
    if (parent === frameWindow) return false;
    frameWindow = parent;
    parent = frameWindow.parent;
  }
  for (const frame of element.querySelectorAll("iframe")) {
    if (frame.contentWindow === frameWindow) return true;
  }
  return false;
}

// The focused element of a frame is in the frame's document, so a focused frame
// inside a hovercard, which is the active element of the hovercard's document,
// counts as focus within the hovercard.
function hasFocusInHovercard(card: HTMLElement) {
  if (hasFocusWithin(card)) return true;
  const activeElement = getActiveElement(card, { frame: false });
  if (!activeElement) return false;
  return contains(card, activeElement);
}

/** Where the mouse is. */
interface MouseTarget {
  /** The element under the mouse and its ancestors. */
  path: EventTarget[];
  /** The window of the document under the mouse. */
  view: Window | null;
}

// The path of a mouse event in a frame stays in the frame's document, so a
// frame inside a hovercard counts as the hovercard.
function isOnHovercard(card: HTMLElement, { path, view }: MouseTarget) {
  if (path.includes(card)) return true;
  if (!view) return false;
  return isFrameWindowInside(card, view);
}

interface IsMovingOnHovercardParams {
  target: MouseTarget;
  card: HTMLElement;
  hoverElements: Array<HTMLElement | null>;
  nested?: HTMLElement[];
}

function isMovingOnHovercard({
  target,
  card,
  hoverElements,
  nested,
}: IsMovingOnHovercardParams) {
  // The hovercard element has focus so we should keep it visible.
  if (hasFocusInHovercard(card)) return true;
  // The mouse is moving on an element inside the hovercard.
  if (isOnHovercard(card, target)) return true;
  // The mouse is moving on an element inside an anchor or disclosure element.
  if (
    hoverElements.some((element) => element && target.path.includes(element))
  ) {
    return true;
  }
  // The mouse is moving on an element inside a nested hovercard.
  if (
    nested?.some(
      (card) => hasFocusInHovercard(card) || isOnHovercard(card, target),
    )
  ) {
    return true;
  }
  return false;
}

// Whether the element is in the tree of its document, outside shadow roots.
function isInDocumentTree(element: Element) {
  return element.getRootNode() === getDocument(element);
}

interface DisableEventOnTransitParams {
  event: MouseEvent;
  element: Element;
  enterPointRef: RefObject<Point | null>;
  disablePointerEvents: (event: MouseEvent) => boolean;
  refreshEnterPoint?: boolean;
}

// These events can trigger focus on other elements and close the hovercard
// while the mouse is still moving toward it.
function disableEventOnTransit({
  event,
  element,
  enterPointRef,
  disablePointerEvents,
  refreshEnterPoint = false,
}: DisableEventOnTransitParams) {
  const enterPoint = enterPointRef.current;
  if (!enterPoint) return false;

  const currentPoint = getEventPoint(event);
  const polygon = getElementPolygon(element, enterPoint);
  if (!isPointInPolygon(currentPoint, polygon)) return false;

  if (refreshEnterPoint) {
    enterPointRef.current = currentPoint;
  }

  if (disablePointerEvents(event)) {
    event.preventDefault();
    event.stopPropagation();
  }

  return true;
}

// When the hovercard element has focus, we should move focus back to the anchor
// element when the hovercard gets hidden (or unmounted).
function useAutoFocusOnHide({
  store,
  ...props
}: HovercardProps & { store: HovercardStore }) {
  const [autoFocusOnHide, setAutoFocusOnHide] = useState(false);
  const mounted = useStoreState(store, "mounted");

  // Resets autoFocusOnHide
  useEffect(() => {
    if (!mounted) {
      // Synchronize focus history with the external hovercard store.
      // oxlint-disable-next-line react/set-state-in-effect
      setAutoFocusOnHide(false);
    }
  }, [mounted]);

  const onFocusProp = props.onFocus;

  const onFocus = useEvent((event: FocusEvent<HTMLType>) => {
    onFocusProp?.(event);
    if (event.defaultPrevented) return;
    setAutoFocusOnHide(true);
  });

  // TODO: Consider reading state.anchorElement directly.
  const finalFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    return sync(store, ["anchorElement"], (state) => {
      finalFocusRef.current = state.anchorElement;
    });
  }, [store]);

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
 * @see https://ariakit.com/components/hovercard
 * @example
 * ```jsx
 * const store = useHovercardStore();
 * const props = useHovercard({ store });
 * <HovercardAnchor store={store}>@username</HovercardAnchor>
 * <Role {...props}>Details</Role>
 * ```
 */
export const useHovercard = createHook<TagName, HovercardOptions>(
  function useHovercard({
    store,
    modal = false,
    portal = modal,
    hideOnEscape = true,
    hideOnHoverOutside = true,
    disablePointerEventsOnApproach = !!hideOnHoverOutside,
    hideWhenAnchorHidden = true,
    ...props
  }) {
    const context = useHovercardProviderContext();
    store = store || context;

    invariant(
      store,
      process.env.NODE_ENV !== "production" &&
        "Hovercard must receive a `store` prop or be wrapped in a HovercardProvider component.",
    );

    const ref = useRef<HTMLType>(null);
    const nestedHovercardsRef = useRef<HTMLElement[]>([]);
    const hideTimeoutRef = useRef(0);
    const enterPointRef = useRef<Point | null>(null);
    const { portalRef, domReady } = usePortalRef(portal, props.portalRef);

    const isMouseMoving = useIsMouseMoving();

    const mayHideOnHoverOutside = !!hideOnHoverOutside;
    const hideOnHoverOutsideProp = useBooleanEvent(hideOnHoverOutside);
    const mayDisablePointerEvents = !!disablePointerEventsOnApproach;
    const disablePointerEventsProp = useBooleanEvent(
      disablePointerEventsOnApproach,
    );

    const open = useStoreState(store, "open");
    const mounted = useStoreState(store, "mounted");

    const clearHideTimeout = useCallback(() => {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = 0;
    }, []);

    // A hovercard stays mounted while its exit transition runs, so the pointer
    // can schedule a hide while it's closed. If something else opens it before
    // that hide runs, such as focus on a tooltip anchor, the hide is stale.
    useEffect(() => {
      return sync(store, ["open"], (state) => {
        if (!state.open) return;
        clearHideTimeout();
      });
    }, [store, clearHideTimeout]);

    // Checks whether the mouse is moving toward the hovercard. If not, hide the
    // card after a short delay (hideTimeout).
    useEffect(() => {
      if (!domReady) return;
      if (!mounted) return;
      if (!mayHideOnHoverOutside && !mayDisablePointerEvents) return;
      const element = ref.current;
      if (!element) return;
      let lastPath: EventTarget[] = [];
      let pressedOnHovercard = false;
      const onPointerDown = (event: PointerEvent) => {
        const target = { path: event.composedPath(), view: event.view };
        const cards = [element, ...nestedHovercardsRef.current];
        pressedOnHovercard = cards.some((card) => isOnHovercard(card, target));
      };
      // Hides the hovercard after a short delay (hideTimeout).
      const scheduleHide = () => {
        if (!store) return;
        const { hideTimeout, timeout } = store.getState();
        hideTimeoutRef.current = window.setTimeout(() => {
          hideTimeoutRef.current = 0;
          if (!store) return;
          // Another trigger can take over the store while the hide is pending,
          // such as the next item in a menubar sharing one menu. The pointer
          // may rest on that trigger without firing another mousemove that
          // would clear the hide, so skip it if the last mousemove was on the
          // store's current anchor or disclosure element.
          // https://github.com/ariakit/ariakit/issues/8086
          const { anchorElement, disclosureElement } = store.getState();
          if (anchorElement && lastPath.includes(anchorElement)) return;
          if (disclosureElement && lastPath.includes(disclosureElement)) return;
          store.hide();
        }, hideTimeout ?? timeout);
      };
      const onMouseMove = (event: MouseEvent) => {
        if (!store) return;
        const path = event.composedPath();
        lastPath = path;
        if (!isMouseMoving()) return;
        // A press on the hovercard keeps it open until the release, even if the
        // press doesn't move focus, such as a drag on a resize grip that goes
        // past the hovercard's edge.
        if (pressedOnHovercard && event.buttons) {
          clearHideTimeout();
          return;
        }
        const { anchorElement, disclosureElement } = store.getState();
        const hoverElements = [anchorElement, disclosureElement];
        const hoveredElement = hoverElements.find(
          (element) => element && path.includes(element),
        );
        // Checks whether the hovercard element has focus or the mouse is moving
        // through valid hovercard elements.
        if (
          isMovingOnHovercard({
            target: { path, view: event.view },
            card: element,
            hoverElements,
            nested: nestedHovercardsRef.current,
          })
        ) {
          // While the mouse is moving over an anchor or disclosure while the
          // hovercard is open, keep track of the mouse position so we can use
          // the last point before the mouse leaves it.
          enterPointRef.current = hoveredElement ? getEventPoint(event) : null;
          clearHideTimeout();
          return;
        }
        // If there's already a scheduled timeout to hide the hovercard, we do
        // nothing.
        if (hideTimeoutRef.current) return;
        // Enter point will be null when the user hovers over the hovercard
        // element. Skip the hide timeout while the mouse is moving toward the
        // hovercard, even when disabling pointer events isn't allowed.
        const movingTowardElement = disableEventOnTransit({
          event,
          element,
          enterPointRef,
          disablePointerEvents: disablePointerEventsProp,
          refreshEnterPoint: true,
        });
        if (movingTowardElement) return;
        if (!hideOnHoverOutsideProp(event)) return;
        scheduleHide();
      };
      // A scroll that counts as hover for the current anchor runs the same
      // check as a mouse move, at the resting mouse position. The pointer isn't
      // moving toward the hovercard, so there's no transit check. A press stops
      // scrolls from counting as hover until the next mouse move without one,
      // so there's no press check either.
      const onScrollHover: ScrollHoverListener = (event, path, point) => {
        if (!store) return;
        const { anchorElement, disclosureElement } = store.getState();
        if (!anchorElement) return;
        const anchor = getScrollHoverAnchor(anchorElement, store);
        if (!anchor?.canHover(event)) return;
        const hoverElements = [anchorElement, disclosureElement];
        const nested = nestedHovercardsRef.current;
        // The path starts from the element at the mouse position, which is the
        // shadow host for anything in a shadow root. So it can't tell if the
        // mouse is still on an anchor or a hovercard there.
        for (const hoverElement of [...hoverElements, element, ...nested]) {
          if (!hoverElement) continue;
          if (!isInDocumentTree(hoverElement)) return;
        }
        lastPath = path;
        const view = getWindow(point.document);
        const target = { path, view };
        if (
          isMovingOnHovercard({ target, card: element, hoverElements, nested })
        ) {
          const onHoverElement = hoverElements.some(
            (element) => element && path.includes(element),
          );
          enterPointRef.current = onHoverElement ? [point.x, point.y] : null;
          clearHideTimeout();
          return;
        }
        if (hideTimeoutRef.current) return;
        // The callback takes a mouse event, so it gets one at the resting mouse
        // position. It's never dispatched.
        const mouseEvent = new view.MouseEvent("mousemove", {
          clientX: point.x,
          clientY: point.y,
        });
        if (!hideOnHoverOutsideProp(mouseEvent)) return;
        scheduleHide();
      };
      return chain(
        addGlobalEventListener("pointerdown", onPointerDown, true),
        addGlobalEventListener("mousemove", onMouseMove, true),
        addScrollHoverListener(onScrollHover),
        clearHideTimeout,
      );
    }, [
      store,
      isMouseMoving,
      domReady,
      mounted,
      mayHideOnHoverOutside,
      mayDisablePointerEvents,
      nestedHovercardsRef,
      clearHideTimeout,
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
        disableEventOnTransit({
          event,
          element,
          enterPointRef,
          disablePointerEvents: disablePointerEventsProp,
        });
      };
      return chain(
        // Note: we may need to add pointer events here in the future.
        addGlobalEventListener("mouseenter", disableEvent, true),
        addGlobalEventListener("mouseover", disableEvent, true),
        addGlobalEventListener("mouseout", disableEvent, true),
        addGlobalEventListener("mouseleave", disableEvent, true),
      );
    }, [domReady, mounted, mayDisablePointerEvents, disablePointerEventsProp]);

    // The autoFocusOnShow state will be set to true when the hovercard
    // disclosure element is clicked. We have to reset it to false when the
    // hovercard element gets hidden.
    useEffect(() => {
      if (!domReady) return;
      if (open) return;
      store?.setAutoFocusOnShow(false);
    }, [store, domReady, open]);

    // On unmount as well.
    const openRef = useLiveRef(open);
    useEffect(() => {
      if (!domReady) return;
      return () => {
        // oxlint-disable-next-line exhaustive-deps
        if (!openRef.current) {
          store?.setAutoFocusOnShow(false);
        }
      };
      // This cleanup intentionally reads the live ref so it can observe the
      // latest open state at unmount time.
      // oxlint-disable-next-line exhaustive-deps
    }, [store, domReady]);

    const registerOnParent = useContext(NestedHovercardContext);

    // Register the hovercard as a nested hovercard on the parent hovercard if
    // it's not a modal, is portal and is mounted. We don't need to register
    // non-portal hovercards because they will be captured by the composed path
    // check in the isMovingOnHovercard function above. This must be a layout
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
    }, [modal, portal, mounted, domReady, registerOnParent]);

    const registerNestedHovercard = useCallback(
      (element: HTMLElement) => {
        clearHideTimeout();
        nestedHovercardsRef.current = [...nestedHovercardsRef.current, element];
        const parentUnregister = registerOnParent?.(element);
        return () => {
          clearHideTimeout();
          nestedHovercardsRef.current = nestedHovercardsRef.current.filter(
            (item) => item !== element,
          );
          parentUnregister?.();
        };
      },
      [clearHideTimeout, registerOnParent],
    );

    props = useWrapElement(
      props,
      (element) => (
        <HovercardScopedContextProvider value={store}>
          <NestedHovercardContext.Provider value={registerNestedHovercard}>
            {element}
          </NestedHovercardContext.Provider>
        </HovercardScopedContextProvider>
      ),
      [store, registerNestedHovercard],
    );

    props = {
      ...props,
      ref: useMergeRefs(ref, props.ref),
    };

    props = useAutoFocusOnHide({ store, ...props });

    // If the hovercard is modal, we should always autoFocus on show.
    const autoFocusOnShow = useStoreState(
      store,
      ["autoFocusOnShow"],
      (state) => modal || state.autoFocusOnShow,
    );

    // Focus returns to the anchor after the hovercard closes on Escape. An
    // anchor that shows the hovercard when it becomes focus-visible, such as a
    // menubar item, opens it again on the next frame, so it hides again if it's
    // open two frames later.
    const escapeClose = useEscapeClose({
      hideOnEscape,
      onClose: props.onClose,
      onEscapeClose() {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (!store?.getState().open) return;
            store.hide();
          });
        });
      },
    });

    props = usePopover({
      store,
      modal,
      portal,
      autoFocusOnShow,
      hideWhenAnchorHidden,
      ...props,
      portalRef,
      hideOnEscape: escapeClose.hideOnEscape,
      onClose: escapeClose.onClose,
    });

    return props;
  },
);

/**
 * Renders a hovercard element, which is a popover that's usually made visible
 * by hovering the mouse cursor over a
 * [`HovercardAnchor`](https://ariakit.com/reference/hovercard-anchor).
 * @see https://ariakit.com/components/hovercard
 * @example
 * ```jsx {3}
 * <HovercardProvider>
 *   <HovercardAnchor>@username</HovercardAnchor>
 *   <Hovercard>Details</Hovercard>
 * </HovercardProvider>
 * ```
 */
export const Hovercard = createDialogComponent(
  forwardRef(function Hovercard(props: HovercardProps) {
    const htmlProps = useHovercard(props);
    return createElement(TagName, htmlProps);
  }),
  useHovercardProviderContext,
);

export interface HovercardOptions<
  T extends ElementType = TagName,
> extends PopoverOptions<T> {
  /**
   * Object returned by the
   * [`useHovercardStore`](https://ariakit.com/reference/use-hovercard-store)
   * hook. If not provided, the closest
   * [`HovercardProvider`](https://ariakit.com/reference/hovercard-provider)
   * component's context will be used.
   */
  store?: HovercardStore;
  /**
   * Determines whether the popover should hide when the mouse leaves the
   * popover or the anchor element and there's no _hover intent_, meaning, the
   * mouse isn't moving toward the popover.
   *
   * This can be either a boolean or a callback receiving the mouse move event
   * that initiated the behavior. The callback should return a boolean. When a
   * scroll counts as hover because of the
   * [`hoverOnScroll`](https://ariakit.com/reference/hovercard-anchor#hoveronscroll)
   * prop, the callback receives a `mousemove` event that isn't dispatched. It
   * has only the `clientX` and `clientY` of the resting mouse pointer, so use
   * `document.elementFromPoint` to find the element under it.
   *
   * **Note**: This behavior won't be triggered when the popover or any of its
   * descendants are in focus, or while a press that started on the popover
   * lasts.
   * @default true
   */
  hideOnHoverOutside?: BooleanOrCallback<MouseEvent>;
  /**
   * Determines if the pointer events outside of the popover and its anchor
   * element should be disabled during _hover intent_, that is, when the mouse
   * is moving toward the popover.
   *
   * This is required as these external events may trigger focus on other
   * elements and close the popover while the user is attempting to hover over
   * it.
   *
   * This can be either a boolean or a callback receiving the mouse event
   * happening during hover intent. The callback should return a boolean.
   * @default true
   */
  disablePointerEventsOnApproach?: BooleanOrCallback<MouseEvent>;
  /**
   * @default false
   */
  modal?: PopoverOptions<T>["modal"];
  /**
   * @default true
   */
  hideWhenAnchorHidden?: PopoverOptions<T>["hideWhenAnchorHidden"];
}

export type HovercardProps<T extends ElementType = TagName> = Props<
  T,
  HovercardOptions<T>
>;
