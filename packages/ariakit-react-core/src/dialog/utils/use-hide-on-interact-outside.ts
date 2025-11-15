import { contains, getDocument, isVisible } from "@ariakit/core/utils/dom";
import { addGlobalEventListener } from "@ariakit/core/utils/events";
import { useEffect, useRef } from "react";
import { isSafariFocusAncestor } from "../../focusable/focusable.tsx";
import { useEvent, useSafeLayoutEffect } from "../../utils/hooks.ts";
import { useStoreState } from "../../utils/store.tsx";
import type { DialogOptions } from "../dialog.tsx";
import type { DialogStore } from "../dialog-store.ts";
import { isElementMarked } from "./mark-tree-outside.ts";
import { usePreviousMouseDownRef } from "./use-previous-mouse-down-ref.ts";

interface EventOutsideOptions {
  store: DialogStore;
  type: string;
  listener: (event: Event) => void;
  capture?: boolean;
  domReady?: boolean | HTMLElement | null;
}

function isInDocument(target: Element) {
  if (target.tagName === "HTML") return true;
  return contains(getDocument(target).body, target);
}

function isDisclosure(disclosure: Element | null, target: Element) {
  if (!disclosure) return false;
  if (contains(disclosure, target)) return true;
  const activeId = target.getAttribute("aria-activedescendant");
  if (activeId) {
    const activeElement = getDocument(disclosure).getElementById(activeId);
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

function useEventOutside({
  store,
  type,
  listener,
  capture,
  domReady,
}: EventOutsideOptions) {
  const callListener = useEvent(listener);
  const open = useStoreState(store, "open");
  const focusedRef = useRef(false);

  useSafeLayoutEffect(() => {
    if (!open) return;
    if (!domReady) return;
    const { contentElement } = store.getState();
    if (!contentElement) return;
    const onFocus = () => {
      focusedRef.current = true;
    };
    contentElement.addEventListener("focusin", onFocus, true);
    return () => contentElement.removeEventListener("focusin", onFocus, true);
  }, [store, open, domReady]);

  useEffect(() => {
    if (!open) return;
    const onEvent = (event: Event) => {
      const { contentElement, disclosureElement } = store.getState();
      const target = event.target as Element | null;
      if (!contentElement) return;
      if (!target) return;
      // When an element is unmounted right after it receives focus, the focus
      // event is triggered after that, when the element isn't part of the
      // current document anymore. We just ignore it.
      if (!isInDocument(target)) return;
      // Event inside dialog
      if (contains(contentElement, target)) return;
      // Event on disclosure
      if (isDisclosure(disclosureElement, target)) return;
      // Event on focus trap
      if (target.hasAttribute("data-focus-trap")) return;
      // Clicked on dialog's bounding box
      if (isMouseEventOnDialog(event, contentElement)) return;
      // We need to check if the content element has been focused at least once
      // before checking if it's marked. This is so hovercards and tooltips
      // don't stay open when new nodes are added to the DOM and focused.
      const focused = focusedRef.current;
      if (focused && !isElementMarked(target, contentElement.id)) return;
      // Since Safari focuses on the closest focusable ancestor and we're not
      // preventing it (see focusable.tsx), dialogs may close on mousedown on
      // their disclosure buttons. So we check if the target of this focus event
      // is triggered by the Safari behavior. See the dialog-menu "open/close
      // menu by clicking on menu button" test.
      if (isSafariFocusAncestor(target)) return;
      // Finally, if the target has been marked as "outside" or is an ancestor
      // of the content element, we call the listener.
      callListener(event);
    };
    return addGlobalEventListener(type, onEvent, capture);
  }, [open, capture]);
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
) {
  const open = useStoreState(store, "open");
  const previousMouseDownRef = usePreviousMouseDownRef(open);
  const props = { store, domReady, capture: true };

  useEventOutside({
    ...props,
    type: "click",
    listener: (event) => {
      const { contentElement } = store.getState();
      const previousMouseDown = previousMouseDownRef.current as Element | null;
      // If there's no previously mousedown'd element, this probably means that
      // the dialog opened with a mousedown event, and a subsequent click event
      // was dispatched outside of the dialog. See form-select example. We just
      // ignore this.
      if (!previousMouseDown) return;
      if (!isVisible(previousMouseDown)) return;
      // This prevents the dialog from closing by dragging the cursor (for
      // example, selecting some text inside the dialog and releasing the mouse
      // outside of it). See:
      // - https://github.com/ariakit/ariakit/issues/1336
      // - https://github.com/ariakit/ariakit/issues/2330
      if (!isElementMarked(previousMouseDown, contentElement?.id)) return;
      if (!shouldHideOnInteractOutside(hideOnInteractOutside, event)) return;
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
      store.hide();
    },
  });

  useEventOutside({
    ...props,
    type: "contextmenu",
    listener: (event) => {
      if (!shouldHideOnInteractOutside(hideOnInteractOutside, event)) return;
      store.hide();
    },
  });
}
