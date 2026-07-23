import { useStoreState } from "@ariakit/react-store";
import { useEvent, useSafeLayoutEffect } from "@ariakit/react-utils";
import {
  addGlobalEventListener,
  contains,
  getDocument,
  getWindow,
  isElement,
} from "@ariakit/utils";
import type { MutableRefObject } from "react";
import { useEffect, useRef } from "react";
import type { DialogStore } from "../dialog-store.ts";
import type { DialogOptions } from "../dialog.tsx";
import { isElementInside, isElementMarked } from "./mark-tree-outside.ts";
import type { EventTargets } from "./use-previous-mouse-down-ref.ts";
import {
  getEventTargets,
  getFrameChain,
  usePreviousMouseDownRef,
} from "./use-previous-mouse-down-ref.ts";

interface EventOutsideOptions {
  store: DialogStore;
  type: string;
  listener: (event: Event) => void;
  capture?: boolean;
  // The open and contentElement states and the focusedRef are tracked once by
  // useHideOnInteractOutside and shared with each useEventOutside call so the
  // dialog doesn't pay for one store subscription (and focusin listener) per
  // event type.
  open?: boolean;
  contentElement?: HTMLElement | null;
  focusedRef: MutableRefObject<boolean>;
}

function getHighestReadableWindow(element: Element) {
  const highestElement = getFrameChain(element).at(-1);
  return getWindow(highestElement ?? element);
}

function isInDocument(target: Element) {
  return target.isConnected;
}

function isDisclosure(disclosure: Element | null, target: Element) {
  if (!disclosure) return false;
  if (contains(disclosure, target)) return true;
  const activeId = target.getAttribute("aria-activedescendant");
  if (activeId) {
    const activeElement = getDocument(target).getElementById(activeId);
    if (activeElement) {
      return contains(disclosure, activeElement);
    }
  }
  return false;
}

function isMouseEventOnDialog(event: Event | MouseEvent, dialog: Element) {
  if (!("clientY" in event)) return false;
  const rect = dialog.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return false;
  return (
    rect.top <= event.clientY &&
    event.clientY <= rect.top + rect.height &&
    rect.left <= event.clientX &&
    event.clientX <= rect.left + rect.width
  );
}

function isElementWithinDialog(
  target: Element,
  contentElement: Element,
  disclosureElement: Element | null,
) {
  if (contains(contentElement, target)) return true;
  if (isDisclosure(disclosureElement, target)) return true;
  if (target.hasAttribute("data-focus-trap")) return true;
  return isElementInside(target, contentElement);
}

function isEventInsideDialog(
  targets: EventTargets,
  contentElement: Element,
  disclosureElement: Element | null,
) {
  return targets.elements.some((target) =>
    isElementWithinDialog(target, contentElement, disclosureElement),
  );
}

function useEventOutside({
  store,
  type,
  listener,
  capture,
  open,
  contentElement,
  focusedRef,
}: EventOutsideOptions) {
  const callListener = useEvent(listener);

  useEffect(() => {
    if (!open) return;
    const onEvent = (event: Event) => {
      const { contentElement, disclosureElement } = store.getState();
      if (!contentElement) return;
      const targets = getEventTargets(event, contentElement);
      const composedTarget = targets.elements[0];
      const target = targets.rootTarget;
      if (!isElement(target)) return;
      // When an element is unmounted right after it receives focus, the focus
      // event is triggered after that, when the element isn't part of the
      // current document anymore. We just ignore it.
      if (composedTarget && !isInDocument(composedTarget)) return;
      if (!isInDocument(target)) return;
      // Persistent and nested elements must suppress outside listeners before
      // the dialog has ever received focus (for example, with
      // autoFocusOnShow={false}). Scanning the composed path extends that
      // positive inside mark through open shadow roots.
      if (isEventInsideDialog(targets, contentElement, disclosureElement)) {
        return;
      }
      const contentDocument = getDocument(contentElement);
      // A target in a parent or sibling document can't be contained by the
      // dialog, so it's outside.
      if (getDocument(target) !== contentDocument) {
        callListener(event);
        return;
      }
      // Clicked on dialog's bounding box
      // Mouse coordinates are relative to the target's viewport, so compare
      // them with this dialog only when both belong to the same document.
      if (
        getDocument(composedTarget ?? target) === contentDocument &&
        isMouseEventOnDialog(event, contentElement)
      ) {
        return;
      }
      // We need to check if the content element has been focused at least once
      // before checking if it's marked. This is so hovercards and tooltips
      // don't stay open when new nodes are added to the DOM and focused.
      const focused = focusedRef.current;
      if (focused && !isElementMarked(target, contentElement.id)) return;
      // Finally, if the target has been marked as "outside" or is an ancestor
      // of the content element, we call the listener.
      callListener(event);
    };
    const win = contentElement
      ? getHighestReadableWindow(contentElement)
      : undefined;
    return addGlobalEventListener(type, onEvent, capture, win);
  }, [open, capture, store, type, callListener, contentElement, focusedRef]);
}

function shouldHideOnInteractOutside(
  hideOnInteractOutside: DialogOptions["hideOnInteractOutside"],
  event: Event,
) {
  if (typeof hideOnInteractOutside === "function") {
    return hideOnInteractOutside(event);
  }
  return !!hideOnInteractOutside;
}

export function useHideOnInteractOutside(
  store: DialogStore,
  hideOnInteractOutside: DialogOptions["hideOnInteractOutside"],
  domReady?: boolean | HTMLElement | null,
  interactedOutsideRef?: MutableRefObject<boolean>,
) {
  const open = useStoreState(store, "open");
  const contentElement = useStoreState(store, "contentElement");
  const eventWindow = contentElement
    ? getHighestReadableWindow(contentElement)
    : undefined;
  const previousMouseDownRef = usePreviousMouseDownRef(
    open,
    eventWindow,
    contentElement,
  );
  const focusedRef = useRef(false);

  // Tracks whether the content element has been focused at least once since
  // the dialog opened. The event listeners below use this to decide whether
  // the marked-tree check applies. Shared by all event types.
  useSafeLayoutEffect(() => {
    if (!open) return;
    if (!domReady) return;
    if (!contentElement) return;
    focusedRef.current = false;
    const onFocus = () => {
      focusedRef.current = true;
    };
    contentElement.addEventListener("focusin", onFocus, true);
    return () => contentElement.removeEventListener("focusin", onFocus, true);
  }, [open, domReady, contentElement]);

  const props = { store, capture: true, open, contentElement, focusedRef };

  useEventOutside({
    ...props,
    type: "click",
    listener: (event) => {
      const { contentElement, disclosureElement } = store.getState();
      const previousMouseDown = previousMouseDownRef.current;
      // If there's no previously mousedown'd element, this probably means that
      // the dialog opened with a mousedown event, and a subsequent click event
      // was dispatched outside of the dialog. See form-select example. We just
      // ignore this.
      if (!previousMouseDown) return;
      // This prevents the dialog from closing by dragging the cursor (for
      // example, selecting some text inside the dialog and releasing the mouse
      // outside of it). See:
      // - https://github.com/ariakit/ariakit/issues/1336
      // - https://github.com/ariakit/ariakit/issues/2330
      if (!contentElement) return;
      if (
        isEventInsideDialog(
          previousMouseDown,
          contentElement,
          disclosureElement,
        )
      ) {
        return;
      }
      const previousRootTarget = previousMouseDown.rootTarget;
      if (!isElement(previousRootTarget)) return;
      if (
        getDocument(previousRootTarget) === getDocument(contentElement) &&
        !isElementMarked(previousRootTarget, contentElement.id)
      ) {
        return;
      }
      if (!shouldHideOnInteractOutside(hideOnInteractOutside, event)) return;
      if (interactedOutsideRef) {
        interactedOutsideRef.current = true;
      }
      store.hide();
    },
  });

  useEventOutside({
    ...props,
    type: "focusin",
    listener: (event) => {
      const { contentElement } = store.getState();
      if (!contentElement) return;
      // Fix for https://github.com/ariakit/ariakit/issues/619
      if (event.target === getDocument(contentElement)) return;
      if (!shouldHideOnInteractOutside(hideOnInteractOutside, event)) return;
      const target = event.target;
      if (
        interactedOutsideRef &&
        isElement(target) &&
        getDocument(target) !== getDocument(contentElement)
      ) {
        interactedOutsideRef.current = true;
      }
      store.hide();
    },
  });

  useEventOutside({
    ...props,
    type: "contextmenu",
    listener: (event) => {
      if (!shouldHideOnInteractOutside(hideOnInteractOutside, event)) return;
      if (interactedOutsideRef) {
        interactedOutsideRef.current = true;
      }
      store.hide();
    },
  });
}
