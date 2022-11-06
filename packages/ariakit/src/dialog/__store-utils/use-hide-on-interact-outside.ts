import { useRef } from "react";
import { useEvent, useLiveRef } from "ariakit-react-utils/hooks";
import { contains, getDocument } from "ariakit-utils/dom";
import { addGlobalEventListener } from "ariakit-utils/events";
import { chain } from "ariakit-utils/misc";
import { DialogOptions } from "../store-dialog";

type Options = Pick<
  DialogOptions,
  "store" | "modal" | "hideOnInteractOutside"
> & {
  nestedDialogs: HTMLElement[];
};

type EventOutsideOptions = {
  store: Options["store"];
  type: string;
  listener: (event: Event) => void;
  nestedDialogs: Array<HTMLElement>;
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

function isBackdrop(dialog: Element | null, target: Element | null) {
  if (!dialog) return false;
  if (!target) return false;
  return (
    target.hasAttribute("data-backdrop") &&
    target.getAttribute("data-backdrop") === dialog.id
  );
}

function dialogContains(target: Element) {
  return (dialog: HTMLElement) => {
    if (contains(dialog, target)) return true;
    if (isBackdrop(dialog, target)) return true;
    return false;
  };
}

function useEventOutside({
  store,
  type,
  listener,
  nestedDialogs,
  capture,
}: EventOutsideOptions) {
  const callListener = useEvent(listener);
  const nestedDialogsRef = useLiveRef(nestedDialogs);

  store.useEffect(
    (state) => {
      if (!state.open) return;
      const onEvent = (event: Event) => {
        const dialog = store.getState().contentElement;
        const disclosure = store.getState().disclosureElement;
        const target = event.target as Element | null;
        if (!dialog) return;
        if (!target) return;
        // When an element is unmounted right after it receives focus, the focus
        // event is triggered after that, when the element isn't part of the
        // current document anymore. We just ignore it.
        if (!isInDocument(target)) return;
        // Event inside dialog
        if (contains(dialog, target)) return;
        // Event on disclosure
        if (disclosure && isDisclosure(disclosure, target)) return;
        // Event on focus trap
        if (target.hasAttribute("data-focus-trap")) return;
        // Event inside a nested dialog
        if (nestedDialogsRef.current.some(dialogContains(target))) return;
        callListener(event);
      };
      return addGlobalEventListener(type, onEvent, capture);
    },
    ["open", capture]
  );
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
  modal,
  hideOnInteractOutside,
  nestedDialogs,
}: Options) {
  const previousMouseDownRef = useRef<EventTarget | null>();

  store.useEffect(
    (state) => {
      if (!state.open) return;
      const onMouseDown = (event: MouseEvent) => {
        previousMouseDownRef.current = event.target;
      };
      return chain(
        addGlobalEventListener("mousedown", onMouseDown, true),
        () => {
          previousMouseDownRef.current = null;
        }
      );
    },
    ["open"]
  );

  const props = { store, nestedDialogs, capture: true };

  useEventOutside({
    ...props,
    type: "mousedown",
    listener: (event) => {
      const dialog = store.getState().contentElement;
      if (!dialog) return;
      if (modal && !shouldHideOnInteractOutside(hideOnInteractOutside, event)) {
        // If the dialog is modal and the user clicked outside the dialog, but
        // shouldHideOnInteractOutside is false, we don't hide the dialog, but
        // ensure focus is placed on it. Otherwise the focus might end up on an
        // element outside of the dialog or the body element itself.
        dialog.focus();
        event.preventDefault();
        event.stopPropagation();
      }
    },
  });

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
      if (!shouldHideOnInteractOutside(hideOnInteractOutside, event)) {
        if (!modal) return;
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      const dialog = store.getState().contentElement;
      const draggingFromDialog = dialog && contains(dialog, previousMouseDown);
      // This prevents the dialog from closing by dragging the cursor (for
      // example, selecting some text inside the dialog and releasing the mouse
      // outside of it). See https://github.com/ariakit/ariakit/issues/1336
      if (draggingFromDialog) return;
      store.hide();
    },
  });

  useEventOutside({
    ...props,
    type: "focusin",
    listener: (event) => {
      const dialog = store.getState().contentElement;
      if (!dialog) return;
      if (!shouldHideOnInteractOutside(hideOnInteractOutside, event)) {
        if (!modal) return;
        // Same as the mousedown listener.
        dialog.focus();
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      // Fix for https://github.com/ariakit/ariakit/issues/619
      if (event.target === getDocument(dialog)) return;
      store.hide();
    },
  });

  useEventOutside({
    ...props,
    type: "contextmenu",
    listener: (event) => {
      const dialog = store.getState().contentElement;
      if (!dialog) return;
      if (!shouldHideOnInteractOutside(hideOnInteractOutside, event)) {
        if (!modal) return;
        // Same as the mousedown listener.
        dialog.focus();
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      store.hide();
    },
  });
}
