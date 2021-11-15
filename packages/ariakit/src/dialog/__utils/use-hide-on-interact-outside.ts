import { RefObject, useEffect } from "react";
import { contains, getDocument } from "ariakit-utils/dom";
import { addGlobalEventListener } from "ariakit-utils/events";
import { ensureFocus } from "ariakit-utils/focus";
import { useEventCallback, useLiveRef } from "ariakit-utils/hooks";
import { DialogOptions } from "../dialog";
import { usePreviousMouseDownRef } from "./use-previous-mouse-down-ref";

type Options = Pick<
  DialogOptions,
  "state" | "modal" | "hideOnInteractOutside"
> & {
  enabled?: boolean;
};

type EventOutsideOptions = {
  type: string;
  listener: (event: Event) => void;
  dialogRef: RefObject<HTMLElement>;
  nestedDialogs: Array<RefObject<HTMLElement>>;
  disclosureRef?: RefObject<HTMLElement>;
  enabled?: boolean;
  capture?: boolean;
};

function isInDocument(target: Element) {
  if (target.tagName === "HTML") return true;
  return contains(getDocument(target).body, target);
}

function isDisclosure(disclosure: Element, target: Element) {
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

function dialogContains(target: Element) {
  return (dialogRef: RefObject<HTMLElement>) => {
    const dialog = dialogRef.current;
    if (!dialog) return false;
    if (contains(dialog, target)) return true;
    if (target.getAttribute("data-dialog-backdrop") === dialogRef.current?.id) {
      return true;
    }
    return false;
  };
}

function useEventOutside({
  type,
  listener,
  dialogRef,
  nestedDialogs,
  disclosureRef,
  enabled,
  capture,
}: EventOutsideOptions) {
  const callListener = useEventCallback(listener);
  const nestedDialogsRef = useLiveRef(nestedDialogs);

  useEffect(() => {
    if (!enabled) return;
    const onEvent = (event: Event) => {
      const container = dialogRef.current;
      const disclosure = disclosureRef?.current;
      const target = event.target as Element;
      if (!container) return;
      // When an element is unmounted right after it receives focus, the focus
      // event is triggered after that, when the element isn't part of the
      // current document anymore. We just ignore it.
      if (!isInDocument(target)) return;
      // Event inside dialog
      if (contains(container, target)) return;
      // Event on disclosure
      if (disclosure && isDisclosure(disclosure, target)) return;
      // Event on focus trap
      if (target.hasAttribute("data-focus-trap")) return;
      // Event inside a nested dialog
      if (nestedDialogsRef.current.some(dialogContains(target))) return;
      callListener(event);
    };
    return addGlobalEventListener(type, onEvent, capture);
  }, [enabled, dialogRef, disclosureRef, callListener, capture]);
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

export function useHideOnInteractOutside(
  dialogRef: RefObject<HTMLElement>,
  nestedDialogs: Array<RefObject<HTMLElement>>,
  { state, modal, hideOnInteractOutside, enabled = state.visible }: Options
) {
  const previousMouseDownRef = usePreviousMouseDownRef(enabled);

  const props = {
    disclosureRef: state.disclosureRef,
    enabled,
    dialogRef,
    nestedDialogs,
    capture: true,
  };

  useEventOutside({
    ...props,
    type: "mousedown",
    listener: (event) => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      if (modal && !shouldHideOnInteractOutside(hideOnInteractOutside, event)) {
        // If the dialog is modal and the user clicked outside the dialog, but
        // shouldHideOnInteractOutside is false, we don't hide the dialog, but
        // ensure focus is placed on it. Otherwise the focus might end up on an
        // element outside of the dialog or the body element itself.
        ensureFocus(dialog);
        event.preventDefault();
        event.stopPropagation();
      }
    },
  });

  useEventOutside({
    ...props,
    type: "click",
    listener: (event) => {
      if (!shouldHideOnInteractOutside(hideOnInteractOutside, event)) {
        if (!modal) return;
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      // Make sure the element that has been clicked is the same that last
      // triggered the mousedown event. This prevents the dialog from closing
      // by dragging the cursor (for example, selecting some text inside the
      // dialog and releasing the mouse outside of it).
      if (previousMouseDownRef.current === event.target) {
        state.hide();
      }
    },
  });

  useEventOutside({
    ...props,
    type: "focusin",
    listener: (event) => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      if (!shouldHideOnInteractOutside(hideOnInteractOutside, event)) {
        if (!modal) return;
        // Same as the mousedown listener.
        ensureFocus(dialog);
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      // Fix for https://github.com/reakit/reakit/issues/619
      if (event.target === getDocument(dialog)) return;
      state.hide();
    },
  });

  useEventOutside({
    ...props,
    type: "contextmenu",
    listener: (event) => {
      const dialog = dialogRef.current;
      if (!dialog) return;
      if (!shouldHideOnInteractOutside(hideOnInteractOutside, event)) {
        if (!modal) return;
        // Same as the mousedown listener.
        ensureFocus(dialog);
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      state.hide();
    },
  });
}
