import type { NotificationStoreItem } from "@ariakit/components/notification/notification-store";
import { useStoreState } from "@ariakit/react-store";
import {
  useEvent,
  useMergeRefs,
  useSafeLayoutEffect,
  useWrapElement,
  createElement,
  createHook,
  forwardRef,
} from "@ariakit/react-utils";
import type { Options, Props } from "@ariakit/react-utils";
import {
  contains,
  getActiveElement,
  getClosestFocusable,
  getWindow,
  hasOwnProperty,
  invariant,
  warnOnce,
} from "@ariakit/utils";
import type { BooleanOrCallback } from "@ariakit/utils";
import type {
  CSSProperties,
  ElementType,
  KeyboardEvent,
  PointerEvent,
} from "react";
import { useContext, useRef, useState } from "react";
import {
  NotificationHeadingContext,
  NotificationItemContext,
  NotificationListContext,
  NotificationMessageContext,
  NotificationRegionContext,
} from "./__notification-context.tsx";
import {
  NotificationScopedContextProvider,
  useNotificationContext,
} from "./notification-context.tsx";

const TagName = "div" satisfies ElementType;
type TagName = typeof TagName;
type HTMLType = HTMLElementTagNameMap[TagName];

export type NotificationSwipeDirection = "up" | "down" | "start" | "end";

interface SwipeState {
  pointerId: number;
  startX: number;
  startY: number;
  x: number;
  y: number;
  direction?: NotificationSwipeDirection;
  swiping: string | null;
  swipeDirection: string | null;
  userSelect: string;
  xStyle: string;
  yStyle: string;
  endXStyle: string;
  endYStyle: string;
}

function setStyleProperty(
  style: CSSStyleDeclaration,
  name: string,
  value: string,
) {
  if (value) {
    style.setProperty(name, value);
  } else {
    style.removeProperty(name);
  }
}

function restoreAttribute(
  element: HTMLElement,
  name: string,
  value: string | null,
) {
  if (value == null) {
    element.removeAttribute(name);
  } else {
    element.setAttribute(name, value);
  }
}

function restoreSwipe(element: HTMLElement, state: SwipeState) {
  restoreAttribute(element, "data-swiping", state.swiping);
  restoreAttribute(element, "data-swipe-direction", state.swipeDirection);
  element.style.userSelect = state.userSelect;
  setStyleProperty(element.style, "--notification-swipe-x", state.xStyle);
  setStyleProperty(element.style, "--notification-swipe-y", state.yStyle);
  setStyleProperty(
    element.style,
    "--notification-swipe-end-x",
    state.endXStyle,
  );
  setStyleProperty(
    element.style,
    "--notification-swipe-end-y",
    state.endYStyle,
  );
}

function releasePointer(element: HTMLElement, pointerId: number) {
  if (!element.hasPointerCapture?.(pointerId)) return;
  element.releasePointerCapture(pointerId);
}

function getDirections(
  value: NotificationSwipeDirection | readonly NotificationSwipeDirection[],
) {
  return Array.isArray(value) ? value : [value];
}

function getTouchAction(
  value: NotificationSwipeDirection | readonly NotificationSwipeDirection[],
) {
  const directions = getDirections(value);
  const horizontal = directions.includes("start") || directions.includes("end");
  const vertical = directions.includes("up") || directions.includes("down");
  if (horizontal && vertical) return "none";
  if (horizontal) return "pan-y";
  if (vertical) return "pan-x";
  return undefined;
}

function getSwipeDirection(
  element: HTMLElement,
  x: number,
  y: number,
): NotificationSwipeDirection | undefined {
  if (!x && !y) return;
  if (Math.abs(x) >= Math.abs(y)) {
    const rtl =
      getWindow(element).getComputedStyle(element).direction === "rtl";
    if (x > 0) return rtl ? "start" : "end";
    return rtl ? "end" : "start";
  }
  return y > 0 ? "down" : "up";
}

/** Returns props to create a Notification component. */
export const useNotification = createHook<TagName, NotificationOptions>(
  function useNotification({
    item,
    removeOnEscape: removeOnEscapeProp,
    removeOnSwipe: removeOnSwipeProp,
    swipeDirection = "end",
    swipeThreshold = 45,
    ...props
  }) {
    const store = useNotificationContext();
    const region = useContext(NotificationRegionContext);
    const list = useContext(NotificationListContext);

    invariant(
      store && region,
      process.env.NODE_ENV !== "production" &&
        "Notification must be wrapped in a NotificationRegion component.",
    );

    const ref = useRef<HTMLType>(null);
    const swipeRef = useRef<SwipeState | null>(null);
    const [headingId, setHeadingId] = useState<string>();
    const [messageId, setMessageId] = useState<string>();
    const ariaLabel = props["aria-label"];
    const ariaLabelledBy = props["aria-labelledby"];
    const timeout = useStoreState(store, ["timeout"], (state) => {
      if (hasOwnProperty(item, "timeout") && item.timeout !== undefined) {
        return item.timeout;
      }
      return state.timeout;
    });

    useSafeLayoutEffect(
      () => store.unstable_renderItem(item.id),
      [store, item.id],
    );

    useSafeLayoutEffect(() => {
      const element = ref.current;
      if (!element) return;
      if (list) return list.register(element);
      return () => {
        const activeElement = getActiveElement(element);
        if (!activeElement || !contains(element, activeElement)) return;
        queueMicrotask(() => {
          if (element.isConnected) return;
          region.restoreFocus();
        });
      };
    }, [list, region]);

    useSafeLayoutEffect(() => {
      if (process.env.NODE_ENV === "production") return;
      const element = ref.current;
      if (!element) return;
      queueMicrotask(() => {
        if (!element.isConnected) return;
        const dismiss = element.querySelector("[data-notification-dismiss]");
        const hasName =
          !!element.getAttribute("aria-label") ||
          !!element.getAttribute("aria-labelledby");
        if (!hasName) {
          warnOnce(
            "Notification must have an accessible name. Render a NotificationHeading or NotificationMessage, or pass an `aria-label` prop.",
            element,
          );
        }
        if (timeout === null && !dismiss) {
          warnOnce(
            "An untimed Notification must contain a NotificationDismiss control.",
            element,
          );
        }
      });
    }, [timeout, headingId, messageId, ariaLabel, ariaLabelledBy]);

    useSafeLayoutEffect(() => {
      const element = ref.current;
      return () => {
        const swipe = swipeRef.current;
        if (!element || !swipe) return;
        swipeRef.current = null;
        releasePointer(element, swipe.pointerId);
        restoreSwipe(element, swipe);
      };
    }, []);

    const onKeyDownProp = props.onKeyDown;
    const onKeyDown = useEvent((event: KeyboardEvent<HTMLType>) => {
      onKeyDownProp?.(event);
      if (event.defaultPrevented) return;
      if (event.key !== "Escape") return;
      const removeOnEscape =
        typeof removeOnEscapeProp === "function"
          ? removeOnEscapeProp(event)
          : (removeOnEscapeProp ?? timeout !== null);
      if (!removeOnEscape) return;
      if (!store.item(item.id)) return;
      store.remove(item.id);
      event.stopPropagation();
    });

    const onPointerDownProp = props.onPointerDown;
    const onPointerDown = useEvent((event: PointerEvent<HTMLType>) => {
      onPointerDownProp?.(event);
      if (event.defaultPrevented) return;
      if (!event.isPrimary || event.button !== 0) return;
      if (swipeRef.current) return;
      const element = event.currentTarget;
      const target = event.target as HTMLElement;
      const focusable = getClosestFocusable(target);
      if (focusable && focusable !== element) return;
      const dismiss = element.querySelector("[data-notification-dismiss]");
      const removeOnSwipe =
        typeof removeOnSwipeProp === "function"
          ? removeOnSwipeProp(event)
          : (removeOnSwipeProp ?? !!dismiss);
      if (!removeOnSwipe) return;
      if (!dismiss && process.env.NODE_ENV !== "production") {
        warnOnce(
          "A swipeable Notification must contain a NotificationDismiss control as a single-pointer alternative.",
          element,
        );
      }
      const style = element.style;
      swipeRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        x: 0,
        y: 0,
        swiping: element.getAttribute("data-swiping"),
        swipeDirection: element.getAttribute("data-swipe-direction"),
        userSelect: style.userSelect,
        xStyle: style.getPropertyValue("--notification-swipe-x"),
        yStyle: style.getPropertyValue("--notification-swipe-y"),
        endXStyle: style.getPropertyValue("--notification-swipe-end-x"),
        endYStyle: style.getPropertyValue("--notification-swipe-end-y"),
      };
      element.setAttribute("data-swiping", "");
      element.style.userSelect = "none";
      element.setPointerCapture?.(event.pointerId);
    });

    const onPointerMoveProp = props.onPointerMove;
    const onPointerMove = useEvent((event: PointerEvent<HTMLType>) => {
      onPointerMoveProp?.(event);
      if (event.defaultPrevented) return;
      const swipe = swipeRef.current;
      if (!swipe || event.pointerId !== swipe.pointerId) return;
      const element = event.currentTarget;
      swipe.x = event.clientX - swipe.startX;
      swipe.y = event.clientY - swipe.startY;
      swipe.direction = getSwipeDirection(element, swipe.x, swipe.y);
      const directions = getDirections(swipeDirection);
      const allowed = !!swipe.direction && directions.includes(swipe.direction);
      const x =
        allowed && (swipe.direction === "start" || swipe.direction === "end")
          ? swipe.x
          : 0;
      const y =
        allowed && (swipe.direction === "up" || swipe.direction === "down")
          ? swipe.y
          : 0;
      element.setAttribute("data-swipe-direction", swipe.direction || "");
      element.style.setProperty("--notification-swipe-x", `${x}px`);
      element.style.setProperty("--notification-swipe-y", `${y}px`);
    });

    const finishSwipe = useEvent(
      (event: PointerEvent<HTMLType>, cancelled: boolean) => {
        const swipe = swipeRef.current;
        if (!swipe || event.pointerId !== swipe.pointerId) return;
        const element = event.currentTarget;
        swipeRef.current = null;
        releasePointer(element, swipe.pointerId);
        if (cancelled || event.defaultPrevented) {
          restoreSwipe(element, swipe);
          return;
        }
        swipe.x = event.clientX - swipe.startX;
        swipe.y = event.clientY - swipe.startY;
        swipe.direction = getSwipeDirection(element, swipe.x, swipe.y);
        element.removeAttribute("data-swiping");
        restoreAttribute(element, "data-swipe-direction", swipe.swipeDirection);
        element.style.userSelect = swipe.userSelect;
        element.style.setProperty("--notification-swipe-end-x", `${swipe.x}px`);
        element.style.setProperty("--notification-swipe-end-y", `${swipe.y}px`);
        element.style.setProperty("--notification-swipe-x", "0px");
        element.style.setProperty("--notification-swipe-y", "0px");
        const directions = getDirections(swipeDirection);
        const allowed =
          !!swipe.direction && directions.includes(swipe.direction);
        const distance =
          swipe.direction === "start" || swipe.direction === "end"
            ? Math.abs(swipe.x)
            : Math.abs(swipe.y);
        if (!allowed || distance < swipeThreshold) return;
        store.remove(item.id);
      },
    );

    const onPointerUpProp = props.onPointerUp;
    const onPointerUp = useEvent((event: PointerEvent<HTMLType>) => {
      onPointerUpProp?.(event);
      finishSwipe(event, false);
    });

    const onPointerCancelProp = props.onPointerCancel;
    const onPointerCancel = useEvent((event: PointerEvent<HTMLType>) => {
      onPointerCancelProp?.(event);
      finishSwipe(event, true);
    });

    const onLostPointerCaptureProp = props.onLostPointerCapture;
    const onLostPointerCapture = useEvent((event: PointerEvent<HTMLType>) => {
      onLostPointerCaptureProp?.(event);
      const swipe = swipeRef.current;
      if (!swipe || event.pointerId !== swipe.pointerId) return;
      swipeRef.current = null;
      restoreSwipe(event.currentTarget, swipe);
    });

    props = useWrapElement(
      props,
      (element) => (
        <NotificationScopedContextProvider value={store}>
          <NotificationItemContext.Provider value={item}>
            <NotificationHeadingContext.Provider value={setHeadingId}>
              <NotificationMessageContext.Provider value={setMessageId}>
                {element}
              </NotificationMessageContext.Provider>
            </NotificationHeadingContext.Provider>
          </NotificationItemContext.Provider>
        </NotificationScopedContextProvider>
      ),
      [store, item],
    );

    const labelledBy =
      props["aria-label"] != null ? undefined : headingId || messageId;
    const describedBy = headingId ? messageId : undefined;
    const touchAction =
      removeOnSwipeProp === false ? undefined : getTouchAction(swipeDirection);
    const style: CSSProperties = {
      touchAction,
      ...props.style,
    };

    return {
      role: "alertdialog",
      "aria-modal": false,
      tabIndex: 0,
      "aria-labelledby": labelledBy,
      "aria-describedby": describedBy,
      ...props,
      style,
      onKeyDown,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onLostPointerCapture,
      ref: useMergeRefs(ref, props.ref),
    };
  },
);

/** Renders an interactive notification card. */
export const Notification = forwardRef(function Notification(
  props: NotificationProps,
) {
  const htmlProps = useNotification(props);
  return createElement(TagName, htmlProps);
});

export interface NotificationOptions<
  _T extends ElementType = TagName,
> extends Options {
  item: NotificationStoreItem;
  removeOnEscape?: BooleanOrCallback<KeyboardEvent<HTMLType>>;
  removeOnSwipe?: BooleanOrCallback<PointerEvent<HTMLType>>;
  swipeDirection?:
    | NotificationSwipeDirection
    | readonly NotificationSwipeDirection[];
  swipeThreshold?: number;
}

export type NotificationProps<T extends ElementType = TagName> = Props<
  T,
  NotificationOptions<T>
>;
