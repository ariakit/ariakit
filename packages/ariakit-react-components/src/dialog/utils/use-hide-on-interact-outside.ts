import { useStoreState } from "@ariakit/react-store";
import { useEvent, useSafeLayoutEffect } from "@ariakit/react-utils";
import { contains, getDocument, getWindow, isElement } from "@ariakit/utils";
import type { MutableRefObject } from "react";
import { useEffect, useRef } from "react";
import type { DialogStore } from "../dialog-store.ts";
import type { DialogOptions } from "../dialog.tsx";
import {
  addFrameTreeEventListener,
  addGlobalWindowFocusListener,
  observeFrameTree,
} from "./__frame-events.ts";
import type { RegisterFrameTreeListener } from "./__frame-events.ts";
import { isElementInside, isElementMarked } from "./mark-tree-outside.ts";
import { usePreviousMouseDownRef } from "./use-previous-mouse-down-ref.ts";

interface EventOutsideOptions {
  store: DialogStore;
  type: keyof DocumentEventMap;
  listener: (event: Event) => void;
  capture?: boolean;
  // The open and contentElement states and the focusedRef are tracked once by
  // useHideOnInteractOutside and shared with each useEventOutside call so the
  // dialog doesn't pay for one store subscription (and focusin listener) per
  // event type.
  open?: boolean;
  contentElement?: HTMLElement | null;
  eventWindow?: Window;
  registerFrameTreeListener: RegisterFrameTreeListener;
  focusedRef: MutableRefObject<boolean>;
  focusInCountRef: MutableRefObject<number>;
}

function getFrameElements(element: Element) {
  const elements = [element];
  let win = getWindow(element);
  while (true) {
    try {
      const frameElement = win.frameElement;
      if (!frameElement) return elements;
      elements.push(frameElement);
      win = getWindow(frameElement);
    } catch {
      return elements;
    }
  }
}

function getAncestorWindow(element: Element) {
  const frameElements = getFrameElements(element);
  return getWindow(frameElements[frameElements.length - 1]);
}

function getElementInDocument(element: Element, doc: Document) {
  return getFrameElements(element).find(
    (frameElement) => getDocument(frameElement) === doc,
  );
}

function isTargetInside(
  target: Element,
  contentElement: Element,
  disclosureElement: Element | null,
) {
  const targetInContentDocument = getElementInDocument(
    target,
    getDocument(contentElement),
  );
  if (
    targetInContentDocument &&
    contains(contentElement, targetInContentDocument)
  ) {
    return true;
  }
  if (disclosureElement) {
    const targetInDisclosureDocument = getElementInDocument(
      target,
      getDocument(disclosureElement),
    );
    if (
      targetInDisclosureDocument &&
      isDisclosure(disclosureElement, targetInDisclosureDocument)
    ) {
      return true;
    }
  }
  const targetElements = getFrameElements(target);
  if (
    targetElements.some((element) => element.hasAttribute("data-focus-trap"))
  ) {
    return true;
  }
  return targetElements.some((element) =>
    isElementInside(element, contentElement),
  );
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

interface IsEventOutsideOptions {
  event: Event;
  target: Element;
  contentElement: Element;
  disclosureElement: Element | null;
  focused: boolean;
}

function isEventOutside({
  event,
  target,
  contentElement,
  disclosureElement,
  focused,
}: IsEventOutsideOptions) {
  // When an element is unmounted right after it receives focus, the focus
  // event is triggered after that, when the element isn't part of the
  // current document anymore. We just ignore it.
  if (!isInDocument(target)) return false;
  const targetElements = getFrameElements(target);
  if (targetElements.some((element) => !isInDocument(element))) return false;
  // Event inside dialog, on disclosure, on focus trap, on a persistent
  // element, or on a nested dialog. Targets from child frames are compared
  // through their frame elements.
  if (isTargetInside(target, contentElement, disclosureElement)) return false;
  const contentDocument = getDocument(contentElement);
  const targetInContentDocument = getElementInDocument(target, contentDocument);
  // Clicked on dialog's bounding box
  if (
    getDocument(target) === contentDocument &&
    isMouseEventOnDialog(event, contentElement)
  ) {
    return false;
  }
  // We need to check if the content element has been focused at least once
  // before checking if it's marked. This is so hovercards and tooltips don't
  // stay open when new nodes are added to the DOM and focused.
  if (
    focused &&
    targetInContentDocument &&
    !isElementMarked(targetInContentDocument, contentElement.id)
  ) {
    return false;
  }
  // Finally, the target has been marked as "outside" or is an ancestor of the
  // content element. A target outside of the content document is also outside
  // unless one of the checks above maps it to an element that's inside.
  return true;
}

interface FrameTreeRegistration {
  setup: (scope: Window) => () => void;
  recoverFocus?: (scope: Window) => void;
  cleanups: Map<Window, () => void>;
}

function useFrameTreeRegistry(open?: boolean, eventWindow?: Window) {
  const registrationsRef = useRef(new Set<FrameTreeRegistration>());
  const cleanupRegistration = (registration: FrameTreeRegistration) => {
    for (const cleanup of registration.cleanups.values()) {
      cleanup();
    }
    registration.cleanups.clear();
  };
  const setupRegistration = (
    registration: FrameTreeRegistration,
    scope: Window,
  ) => {
    registration.cleanups.get(scope)?.();
    registration.cleanups.set(scope, registration.setup(scope));
  };
  const registerFrameTreeListener = useEvent(
    (
      setup: (scope: Window) => () => void,
      recoverFocus?: (scope: Window) => void,
    ) => {
      if (!eventWindow) return () => {};
      const registration = {
        setup,
        recoverFocus,
        cleanups: new Map([[eventWindow, setup(eventWindow)]]),
      };
      registrationsRef.current.add(registration);
      return () => {
        registrationsRef.current.delete(registration);
        cleanupRegistration(registration);
      };
    },
  );

  useEffect(() => {
    if (!open) return;
    if (!eventWindow) return;
    return observeFrameTree(eventWindow, (scope, recoverFocus) => {
      for (const registration of registrationsRef.current) {
        if (scope) {
          setupRegistration(registration, scope);
          if (recoverFocus) {
            registration.recoverFocus?.(scope);
          }
          continue;
        }
        cleanupRegistration(registration);
        setupRegistration(registration, eventWindow);
      }
    });
  }, [open, eventWindow]);

  return registerFrameTreeListener;
}

function useEventOutside({
  store,
  type,
  listener,
  capture,
  open,
  contentElement,
  eventWindow,
  registerFrameTreeListener,
  focusedRef,
  focusInCountRef,
}: EventOutsideOptions) {
  const callListener = useEvent(listener);

  useEffect(() => {
    if (!open) return;
    if (!eventWindow) return;
    const onEvent = (event: Event) => {
      if (type === "focusin") {
        focusInCountRef.current += 1;
      }
      const { contentElement, disclosureElement } = store.getState();
      const target = event.target;
      if (!contentElement) return;
      if (!isElement(target)) return;
      if (
        !isEventOutside({
          event,
          target,
          contentElement,
          disclosureElement,
          focused: focusedRef.current,
        })
      ) {
        return;
      }
      callListener(event);
    };
    return registerFrameTreeListener((scope) =>
      addFrameTreeEventListener({
        type,
        listener: onEvent,
        options: capture,
        scope,
      }),
    );
  }, [
    open,
    capture,
    store,
    type,
    callListener,
    contentElement,
    eventWindow,
    registerFrameTreeListener,
    focusedRef,
    focusInCountRef,
  ]);
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
    ? getAncestorWindow(contentElement)
    : undefined;
  const registerFrameTreeListener = useFrameTreeRegistry(open, eventWindow);
  const previousMouseDownRef = usePreviousMouseDownRef(
    open,
    eventWindow,
    registerFrameTreeListener,
  );
  const focusedRef = useRef(false);
  const focusInCountRef = useRef(0);

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

  const hideOnFocusOutside = useEvent(
    (event: Event, focusEnteredFrame = false) => {
      const { contentElement } = store.getState();
      if (!contentElement) return;
      // Fix for https://github.com/ariakit/ariakit/issues/619
      if (event.target === getDocument(contentElement)) return;
      if (!shouldHideOnInteractOutside(hideOnInteractOutside, event)) return;
      if (
        interactedOutsideRef &&
        (focusEnteredFrame ||
          (isElement(event.target) &&
            getDocument(event.target) !== getDocument(contentElement)))
      ) {
        interactedOutsideRef.current = true;
      }
      store.hide();
    },
  );

  const props = {
    store,
    capture: true,
    open,
    contentElement,
    eventWindow,
    registerFrameTreeListener,
    focusedRef,
    focusInCountRef,
  };

  useEffect(() => {
    if (!open) return;
    if (!contentElement) return;
    if (!eventWindow) return;
    const contentWindow = getWindow(contentElement);
    const pendingFocus = new Map<
      Window,
      { clear: () => void; event: FocusEvent }
    >();
    const onWindowFocus = (event: FocusEvent, focusedWindow: Window) => {
      if (
        event.target !== event.currentTarget &&
        event.target !== focusedWindow.document
      ) {
        return;
      }
      if (focusedWindow === contentWindow) return;
      let frameElement: Element | null;
      try {
        frameElement = focusedWindow.frameElement;
      } catch {
        return;
      }
      if (!frameElement) return;
      const pending = pendingFocus.get(focusedWindow);
      if (pending) {
        if (!event.isTrusted || pending.event.isTrusted) return;
        pending.clear();
        pendingFocus.delete(focusedWindow);
      }
      const focusInCount = focusInCountRef.current;
      const timer = eventWindow.setTimeout(() => {
        pendingFocus.delete(focusedWindow);
        if (!store.getState().open) return;
        // Focusable content inside a frame dispatches a native focusin
        // after the Window focus event. In that case, the native event
        // wins.
        if (focusInCount !== focusInCountRef.current) return;
        const { contentElement, disclosureElement } = store.getState();
        if (!contentElement) return;
        if (
          !isEventOutside({
            event,
            target: frameElement,
            contentElement,
            disclosureElement,
            // A synchronously inserted frame may receive Window focus
            // before its host is included in the dialog's tree snapshot.
            focused: false,
          })
        ) {
          return;
        }
        hideOnFocusOutside(event, true);
      }, 0);
      const clearTimer = () => eventWindow.clearTimeout(timer);
      pendingFocus.set(focusedWindow, { clear: clearTimer, event });
    };
    const unregister = registerFrameTreeListener(
      (scope) => addGlobalWindowFocusListener(onWindowFocus, scope),
      (focusedWindow) => {
        // Firefox can report an already-focused frame only after its native
        // focus event has fired. Preserve the interaction with an explicitly
        // untrusted fallback event.
        const view = focusedWindow.document.defaultView;
        if (!view) return;
        onWindowFocus(new view.FocusEvent("focus"), focusedWindow);
      },
    );
    return () => {
      unregister();
      for (const pending of pendingFocus.values()) {
        pending.clear();
      }
      pendingFocus.clear();
    };
  }, [
    open,
    store,
    contentElement,
    eventWindow,
    registerFrameTreeListener,
    focusedRef,
    focusInCountRef,
    hideOnFocusOutside,
  ]);

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
      // This prevents the dialog from closing by dragging the cursor (for
      // example, selecting some text inside the dialog and releasing the mouse
      // outside of it). See:
      // - https://github.com/ariakit/ariakit/issues/1336
      // - https://github.com/ariakit/ariakit/issues/2330
      if (!contentElement) return;
      if (!isElement(previousMouseDown)) return;
      const { disclosureElement } = store.getState();
      if (
        isTargetInside(previousMouseDown, contentElement, disclosureElement)
      ) {
        return;
      }
      const targetInContentDocument = getElementInDocument(
        previousMouseDown,
        getDocument(contentElement),
      );
      if (
        targetInContentDocument &&
        !isElementMarked(targetInContentDocument, contentElement.id)
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
    listener: hideOnFocusOutside,
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
