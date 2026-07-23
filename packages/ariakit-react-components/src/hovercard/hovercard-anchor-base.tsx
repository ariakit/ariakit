import {
  useBooleanEvent,
  useEvent,
  useIsMouseMoving,
  useMergeRefs,
  createElement,
  createHook,
  forwardRef,
} from "@ariakit/react-utils";
import type { Props } from "@ariakit/react-utils";
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

export const useHovercardAnchorBase = createHook<
  TagName,
  HovercardAnchorBaseOptions
>(function useHovercardAnchorBase({
  store,
  showOnHover = true,
  setAnchorElement = true,
  ...props
}) {
  const disabled = disabledFromProps(props);
  const anchorRef = useRef<HTMLElement | null>(null);
  const showTimeoutRef = useRef(0);

  // Clear the show timeout if the anchor is unmounted
  useEffect(() => () => window.clearTimeout(showTimeoutRef.current), []);

  // Clear the show timeout if the mouse leaves the anchor element. We're
  // using the native mouseleave event instead of React's onMouseLeave so we
  // bypass the event.stopPropagation() logic set on the Hovercard component
  // for when the mouse is moving toward the Hovercard.
  useEffect(() => {
    const onMouseLeave = (event: MouseEvent) => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      if (event.target !== anchor) return;
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
    if (setAnchorElement) {
      store.setAnchorElement(element);
    }
    store.setDisclosureElement(element);
    const { showTimeout, timeout } = store.getState();
    const showHovercard = () => {
      showTimeoutRef.current = 0;
      // Let's check again if the mouse is moving. This is to avoid showing
      // the hovercard on mobile clicks or after clicking on the anchor.
      if (!isMouseMoving()) return;
      if (setAnchorElement) {
        store.setAnchorElement(element);
      }
      store.show();
      queueMicrotask(() => {
        // We need to set the anchor element as the hovercard disclosure
        // element only when the hovercard is shown so it doesn't get
        // assigned an arbitrary element by the dialog component.
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
      const previousElement = anchorRef.current;
      anchorRef.current = element;
      if (!setAnchorElement) return;
      const { anchorElement } = store.getState();
      if (!element && anchorElement !== previousElement) return;
      if (element && anchorElement?.isConnected) return;
      // Preserve a connected anchor when new anchors are added to the DOM.
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
});

export const HovercardAnchorBase = forwardRef(function HovercardAnchorBase(
  props: HovercardAnchorBaseProps,
) {
  const htmlProps = useHovercardAnchorBase(props);
  return createElement(TagName, htmlProps);
});

export interface HovercardAnchorBaseOptions<
  T extends ElementType = TagName,
> extends FocusableOptions<T> {
  store: HovercardStore;
  showOnHover?: BooleanOrCallback<ReactMouseEvent<HTMLElement>>;
  setAnchorElement?: boolean;
}

export type HovercardAnchorBaseProps<T extends ElementType = TagName> = Props<
  T,
  HovercardAnchorBaseOptions<T>
>;
