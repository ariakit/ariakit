import { useEffect } from "react";
import { contains, getDocument, isVisible } from "@ariakit/core/utils/dom";
import { addGlobalEventListener } from "@ariakit/core/utils/events";
import { useEvent } from "../../utils/hooks.js";
import type { DialogOptions } from "../dialog.js";
import { isElementMarked } from "./mark-tree-outside.js";
import { usePreviousMouseDownRef } from "./use-previous-mouse-down-ref.js";

type Options = Pick<DialogOptions, "store" | "modal" | "hideOnInteractOutside">;

type EventOutsideOptions = {
  store: Options["store"];
  type: string;
  listener: (event: Event) => void;
  capture?: boolean;
};

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

function clickedOnDialog(dialog: Element, event: Event | MouseEvent) {
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
}: EventOutsideOptions) {
  const callListener = useEvent(listener);
  const open = store.useState("open");

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
      // TODO: Explain
      if (clickedOnDialog(contentElement, event)) return;
      // TODO: Explain
      if (isElementMarked(target) || contains(target, contentElement)) {
        callListener(event);
      }
    };
    return addGlobalEventListener(type, onEvent, capture);
  }, [open, capture]);
}

function shouldHideOnInteractOutside(
  hideOnInteractOutside: DialogOptions["hideOnInteractOutside"],
  event: Event
) {
  if (typeof hideOnInteractOutside === "function") {
    return hideOnInteractOutside(event);
  }
  return !!hideOnInteractOutside;
}

export function useHideOnInteractOutside({
  store,
  hideOnInteractOutside,
}: Options) {
  const open = store.useState("open");
  const previousMouseDownRef = usePreviousMouseDownRef(open);
  const props = { store, capture: false };

  useEventOutside({
    ...props,
    type: "click",
    listener: (event) => {
      const previousMouseDown = previousMouseDownRef.current as Element | null;
      // If there's no previously mousedown'd element, this probably means that
      // the dialog opened with a mousedown event, and a subsequent click event
      // was dispatched outside of the dialog. See form-select example. We just
      // ignore this.
      if (!previousMouseDown) return;
      if (!isVisible(previousMouseDown)) return;
      const dialog = store.getState().contentElement;
      // TODO: Should check if previousMouseDown was marked.
      const draggingFromDialog = dialog && contains(dialog, previousMouseDown);
      // This prevents the dialog from closing by dragging the cursor (for
      // example, selecting some text inside the dialog and releasing the mouse
      // outside of it). See https://github.com/ariakit/ariakit/issues/1336
      if (draggingFromDialog) return;
      if (!shouldHideOnInteractOutside(hideOnInteractOutside, event)) return;
      store.hide();
    },
  });

  useEventOutside({
    ...props,
    type: "focusin",
    listener: (event) => {
      const dialog = store.getState().contentElement;
      if (!dialog) return;
      // Fix for https://github.com/ariakit/ariakit/issues/619
      if (event.target === getDocument(dialog)) return;
      if (!shouldHideOnInteractOutside(hideOnInteractOutside, event)) return;
      store.hide();
    },
  });

  useEventOutside({
    ...props,
    type: "contextmenu",
    listener: (event) => {
      const dialog = store.getState().contentElement;
      if (!dialog) return;
      if (!shouldHideOnInteractOutside(hideOnInteractOutside, event)) return;
      store.hide();
    },
  });
}
