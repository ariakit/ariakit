import type { FocusEvent, RefCallback } from "react";
import { useCallback, useRef } from "react";

interface CompositeFocusWorkaroundOptions {
  popoverIsScrollport?: boolean;
}

// TODO: Remove this workaround once https://github.com/ariakit/ariakit/issues/6986
// is fixed. It relies on Ariakit's private data-placing and data-autofocus
// markers, removes the latter until its item remounts, supports one explicit
// vertical scrollport, and cannot coordinate every Composite/Dialog focus
// path.
export function useCompositeFocusWorkaround({
  popoverIsScrollport = false,
}: CompositeFocusWorkaroundOptions = {}) {
  const selectElementRef = useRef<HTMLButtonElement>(null);
  const popoverElementRef = useRef<HTMLDivElement>(null);
  const scrollportElementRef = useRef<HTMLDivElement>(null);
  const presentationTargetRef = useRef<HTMLElement>(null);
  const observerRef = useRef<MutationObserver>(null);

  const disconnectObserver = useCallback(() => {
    observerRef.current?.disconnect();
    observerRef.current = null;
  }, []);

  const ownsPresentationFocus = useCallback(() => {
    const selectElement = selectElementRef.current;
    if (!selectElement) return false;
    const activeElement = selectElement.ownerDocument.activeElement;
    if (activeElement === selectElement) return true;
    return !!popoverElementRef.current?.contains(activeElement);
  }, []);

  const presentSelectedItem = useCallback(() => {
    const popoverElement = popoverElementRef.current;
    const scrollportElement = scrollportElementRef.current;
    const capturedTarget = presentationTargetRef.current;
    presentationTargetRef.current = null;
    if (!popoverElement) return;
    if (!scrollportElement) return;
    if (!ownsPresentationFocus()) return;

    const autoFocusElements = popoverElement.querySelectorAll<HTMLElement>(
      "[data-autofocus=true]",
    );
    const lastAutoFocusElement = autoFocusElements.item(
      autoFocusElements.length - 1,
    );
    const targetElement = lastAutoFocusElement || capturedTarget;
    if (!targetElement?.isConnected) return;
    if (!scrollportElement.contains(targetElement)) return;

    const scrollportRect = scrollportElement.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    const scrollportCenter =
      scrollportRect.top +
      scrollportElement.clientTop +
      scrollportElement.clientHeight / 2;
    const targetCenter = targetRect.top + targetRect.height / 2;
    scrollportElement.scrollTop += targetCenter - scrollportCenter;
  }, [ownsPresentationFocus]);

  const observePopover = useCallback(
    (popoverElement: HTMLDivElement) => {
      const MutationObserver =
        popoverElement.ownerDocument.defaultView?.MutationObserver;
      if (!MutationObserver) return;
      const observer = new MutationObserver(() => {
        if (popoverElementRef.current !== popoverElement) return;
        if (popoverElement.hasAttribute("data-placing")) {
          presentationTargetRef.current = null;
          return;
        }
        presentSelectedItem();
      });
      observer.observe(popoverElement, {
        attributeFilter: ["data-placing"],
      });
      observerRef.current = observer;
      if (popoverElement.hasAttribute("data-placing")) return;
      popoverElement.ownerDocument.defaultView?.queueMicrotask(
        presentSelectedItem,
      );
    },
    [presentSelectedItem],
  );

  const selectRef = useCallback<RefCallback<HTMLButtonElement>>((element) => {
    selectElementRef.current = element;
  }, []);

  const popoverRef = useCallback<RefCallback<HTMLDivElement>>(
    (element) => {
      disconnectObserver();
      popoverElementRef.current = element;
      presentationTargetRef.current = null;
      if (popoverIsScrollport) {
        scrollportElementRef.current = element;
      }
      if (element) {
        observePopover(element);
      }
    },
    [disconnectObserver, observePopover, popoverIsScrollport],
  );

  const scrollportRef = useCallback<RefCallback<HTMLDivElement>>((element) => {
    scrollportElementRef.current = element;
  }, []);

  const onFocusCapture = useCallback((event: FocusEvent<HTMLDivElement>) => {
    const popoverElement = popoverElementRef.current;
    if (!popoverElement?.hasAttribute("data-placing")) return;
    const selectElement = selectElementRef.current;
    if (!selectElement?.isConnected) return;

    const targetElement = event.target as HTMLElement;
    if (targetElement.hasAttribute("data-autofocus")) {
      presentationTargetRef.current = targetElement;
      // Composite checks this marker after focusing the item. Removing it
      // prevents its pending scroll from escaping the unplaced popup.
      targetElement.removeAttribute("data-autofocus");
    }
    event.preventDefault();
    event.stopPropagation();
    selectElement.focus({ preventScroll: true });
  }, []);

  const autoFocusOnShow = useCallback(
    (element: HTMLElement | null) => {
      if (!element) return false;
      if (!ownsPresentationFocus()) return false;
      return element !== popoverElementRef.current;
    },
    [ownsPresentationFocus],
  );

  return {
    autoFocusOnShow,
    onFocusCapture,
    popoverRef,
    scrollportRef,
    selectRef,
  };
}
