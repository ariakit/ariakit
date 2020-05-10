import * as React from "react";
import { useLiveRef } from "reakit-utils/useLiveRef";
import { warning } from "reakit-warning";
import { getDocument } from "reakit-utils/getDocument";
import { contains } from "reakit-utils/contains";
import { isFocusTrap } from "./useFocusTrap";

function dialogContains(target: Element) {
  return (dialogRef: React.RefObject<HTMLElement>) => {
    const dialog = dialogRef.current;
    if (!dialog) return false;
    if (contains(dialog, target)) return true;
    const document = getDocument(dialog);
    const backdrop = document.querySelector(`[data-dialog-ref="${dialog.id}"]`);
    if (backdrop) {
      return contains(backdrop, target);
    }
    return false;
  };
}

function isDisclosure(target: Element) {
  return (disclosure: HTMLElement) => {
    if (contains(disclosure, target)) return true;
    return (
      disclosure.id &&
      disclosure.id === target.getAttribute?.("aria-activedescendant")
    );
  };
}

export function useEventListenerOutside(
  containerRef: React.RefObject<HTMLElement>,
  disclosuresRef: React.RefObject<HTMLElement[]>,
  nestedDialogs: Array<React.RefObject<HTMLElement>>,
  eventType: string,
  listener?: (e: Event) => void,
  shouldListen?: boolean
) {
  const listenerRef = useLiveRef(listener);

  React.useEffect(() => {
    if (!shouldListen) return undefined;

    const handleEvent = (event: Event) => {
      if (!listenerRef.current) return;

      const container = containerRef.current;
      const disclosures = disclosuresRef.current || [];
      const target = event.target as Element;

      if (!container) {
        warning(
          true,
          "Can't detect events outside dialog because `ref` wasn't passed to component.",
          "See https://reakit.io/docs/dialog"
        );
        return;
      }

      // Click inside dialog
      if (contains(container, target)) return;

      // Click on disclosure
      if (disclosures.length && disclosures.some(isDisclosure(target))) {
        return;
      }

      // Click inside a nested dialog or focus trap
      if (isFocusTrap(target) || nestedDialogs.some(dialogContains(target))) {
        return;
      }

      listenerRef.current(event);
    };

    const document = getDocument(containerRef.current);
    document.addEventListener(eventType, handleEvent, true);
    return () => {
      document.removeEventListener(eventType, handleEvent, true);
    };
  }, [
    containerRef,
    disclosuresRef,
    nestedDialogs,
    eventType,
    shouldListen,
    listenerRef,
  ]);
}
