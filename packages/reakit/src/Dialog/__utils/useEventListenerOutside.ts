import * as React from "react";
import { useLiveRef } from "reakit-utils/useLiveRef";
import { warning } from "reakit-utils/warning";
import { isFocusTrap } from "./useFocusTrap";

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
      if (
        isFocusTrap(target) ||
        nestedDialogs.find(dialog =>
          Boolean(dialog.current && dialog.current.contains(target))
        )
      ) {
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
