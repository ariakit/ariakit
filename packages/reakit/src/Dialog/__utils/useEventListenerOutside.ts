import * as React from "react";
import { useLiveRef } from "reakit-utils/useLiveRef";
import { warning } from "reakit-utils/warning";
import { getDocument } from "reakit-utils/getDocument";
import { isFocusTrap } from "./useFocusTrap";

function dialogContains(target: Element) {
  return (dialog: React.RefObject<HTMLElement>) => {
    if (!dialog.current) return false;

    if (dialog.current.contains(target)) {
      return true;
    }

    const document = getDocument(dialog.current);
    const backdrop = document.querySelector(
      `[data-dialog-ref="${dialog.current.id}"]`
    );

    if (backdrop) {
      return backdrop.contains(target);
    }

    return false;
  };
}

/**
 * TODO:
 * Composite needs to have the concept of null current id
 * On roving-tabindex, the first item should still be tabindex="0"
 * But on aria-activedescendant, there should be no aria-selected nor aria-activedescendant id
 * useCompositeState({ currentId: null });
 */
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
          "[reakit/Dialog]",
          "Can't detect events outside dialog because `ref` wasn't passed to component.",
          "See https://reakit.io/docs/dialog"
        );
        return;
      }

      // Click inside dialog
      if (container.contains(target)) return;

      // Click on disclosure
      if (
        disclosures.length &&
        disclosures.some(disclosure => disclosure.contains(target))
      ) {
        return;
      }

      // Click inside a nested dialog or focus trap
      if (isFocusTrap(target) || nestedDialogs.find(dialogContains(target))) {
        return;
      }

      listenerRef.current(event);
    };

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
    listenerRef
  ]);
}
