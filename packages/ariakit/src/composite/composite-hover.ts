import { MouseEvent as ReactMouseEvent, useCallback, useEffect } from "react";
import { closest, contains } from "ariakit-utils/dom";
import { addGlobalEventListener } from "ariakit-utils/events";
import { hasFocusWithin } from "ariakit-utils/focus";
import { useBooleanEventCallback, useEventCallback } from "ariakit-utils/hooks";
import { createMemoComponent, useStore } from "ariakit-utils/store";
import { createElement, createHook } from "ariakit-utils/system";
import { As, BooleanOrCallback, Options, Props } from "ariakit-utils/types";
import { CompositeContext, getScrollingElement } from "./__utils";
import { CompositeState } from "./composite-state";

let screenX = 0;
let screenY = 0;

function handleGlobalMouseMove(event: MouseEvent) {
  screenX = event.screenX;
  screenY = event.screenY;
}

function isScrolling(event: ReactMouseEvent | MouseEvent) {
  return (
    Math.abs(event.screenX - screenX) === 0 &&
    Math.abs(event.screenY - screenY) === 0
  );
}

function getMouseDestination(event: ReactMouseEvent<HTMLElement>) {
  const relatedTarget = event.relatedTarget as Node | null;
  if (relatedTarget?.nodeType === Node.ELEMENT_NODE) {
    return relatedTarget as Element;
  }
  return null;
}

function hoveringInside(event: ReactMouseEvent<HTMLElement>) {
  const nextElement = getMouseDestination(event);
  if (!nextElement) return false;
  return contains(event.currentTarget, nextElement);
}

const stackingContextWillChangeProps =
  /\b(?:position|zIndex|opacity|transform|mixBlendMode|filter|isolation)\b/;

function isFlexItem(element: Element) {
  const parentElement = element.parentElement;
  if (!parentElement) return false;
  const display = getComputedStyle(parentElement).display;
  return display === "flex" || display === "inline-flex";
}

function isStackingContext(element: Element) {
  const style = getComputedStyle(element);

  // https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context
  if (style.position === "fixed") return true;
  if (style.zIndex !== "auto" && style.position !== "static") return true;
  if (isFlexItem(element)) return true;
  if (+style.opacity < 1) return true;
  if ("transform" in style && style.transform !== "none") return true;
  if ("mixBlendMode" in style && style.mixBlendMode !== "normal") return true;
  if ("filter" in style && style.filter !== "none") return true;
  if ("isolation" in style && style.isolation === "isolate") return true;
  if (stackingContextWillChangeProps.test(style.willChange)) return true;

  return false;
}

function findStackingContext(element: Element | null) {
  while (element) {
    if (isStackingContext(element)) return element;
    element = element.parentElement;
  }
  return element;
}

function isPartiallyHidden(element: Element) {
  const elementRect = element.getBoundingClientRect();
  const scroller = getScrollingElement(findStackingContext(element));
  if (!scroller) return false;
  const scrollerRect = scroller.getBoundingClientRect();

  const isHTML = scroller.tagName === "HTML";
  const scrollerTop = isHTML
    ? scrollerRect.top + scroller.scrollTop
    : scrollerRect.top;
  const scrollerBottom = isHTML ? scroller.clientHeight : scrollerRect.bottom;
  const scrollerLeft = isHTML
    ? scrollerRect.left + scroller.scrollLeft
    : scrollerRect.left;
  const scrollerRight = isHTML ? scroller.clientWidth : scrollerRect.right;

  const top = elementRect.top <= scrollerTop;
  const left = elementRect.left <= scrollerLeft;
  const bottom = elementRect.bottom >= scrollerBottom;
  const right = elementRect.right >= scrollerRight;

  return top || left || bottom || right;
}

function movingToAnotherItem(event: ReactMouseEvent<HTMLElement>) {
  const dest = getMouseDestination(event);
  if (!dest) return false;
  const item = closest(dest, "[data-composite-hover]");
  if (!item) return false;
  return !isPartiallyHidden(item);
}

/**
 * A component hook that returns props that can be passed to `Role` or any other
 * Ariakit component to render an element in a composite widget that receives
 * focus on mouse move and loses focus to the composite base element on mouse
 * leave. This should be combined with the `CompositeItem` component, the
 * `useCompositeItem` hook or any component/hook that uses them underneath.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const state = useCompositeState();
 * const props = useCompositeHover({ state });
 * <CompositeItem state={state} {...props}>Item</CompositeItem>
 * ```
 */
export const useCompositeHover = createHook<CompositeHoverOptions>(
  ({ state, focusOnHover = true, ...props }) => {
    state = useStore(state || CompositeContext, ["move"]);

    const focusOnHoverProp = useBooleanEventCallback(focusOnHover);
    const onMouseMoveProp = useEventCallback(props.onMouseMove);

    useEffect(() => {
      return addGlobalEventListener("mousemove", handleGlobalMouseMove);
    }, []);

    const onMouseMove = useCallback(
      (event: ReactMouseEvent<HTMLDivElement>) => {
        onMouseMoveProp(event);
        if (event.defaultPrevented) return;
        if (hasFocusWithin(event.currentTarget)) return;
        if (!focusOnHoverProp(event)) return;
        if (isPartiallyHidden(event.currentTarget)) return;
        event.currentTarget.focus();
      },
      [onMouseMoveProp, focusOnHoverProp]
    );

    const onMouseLeaveProp = useEventCallback(props.onMouseLeave);

    const onMouseLeave = useCallback(
      (event: ReactMouseEvent<HTMLDivElement>) => {
        onMouseLeaveProp(event);
        if (isScrolling(event)) return;
        if (event.defaultPrevented) return;
        if (hoveringInside(event)) return;
        if (movingToAnotherItem(event)) return;
        if (!focusOnHoverProp(event)) return;
        // Move focus to the composite container.
        state?.move(null);
      },
      [onMouseLeaveProp, state?.move]
    );

    props = {
      "data-composite-hover": "",
      ...props,
      onMouseMove,
      onMouseLeave,
    };

    return props;
  }
);

/**
 * A component that renders an element in a composite widget that receives focus
 * on mouse move and loses focus to the composite base element on mouse leave.
 * This should be combined with the `CompositeItem` component, the
 * `useCompositeItem` hook or any component/hook that uses them underneath.
 * @see https://ariakit.org/components/composite
 * @example
 * ```jsx
 * const composite = useCompositeState();
 * <Composite state={composite}>
 *   <CompositeHover as={CompositeItem}>Item</CompositeHover>
 * </Composite>
 * ```
 */
export const CompositeHover = createMemoComponent<CompositeHoverOptions>(
  (props) => {
    const htmlProps = useCompositeHover(props);
    return createElement("div", htmlProps);
  }
);

export type CompositeHoverOptions<T extends As = "div"> = Options<T> & {
  /**
   * Object returned by the `useCompositeState` hook. If not provided, the
   * parent `Composite` component's context will be used.
   */
  state?: CompositeState;
  /**
   * Whether to focus the composite item on hover.
   * @default true
   */
  focusOnHover?: BooleanOrCallback<ReactMouseEvent<HTMLElement>>;
};

export type CompositeHoverProps<T extends As = "div"> = Props<
  CompositeHoverOptions<T>
>;
