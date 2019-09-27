import * as React from "react";
import { useLiveRef } from "reakit-utils/useLiveRef";
import { warning } from "reakit-utils/warning";
import { isFocusTrap } from "./useFocusTrap";

export function useEventListenerOutside(
  targetRef: React.RefObject<HTMLElement>,
  disclosuresRef: React.RefObject<HTMLElement[]>,
  nestedDialogs: Array<React.RefObject<HTMLElement>>,
  event: string,
  listener?: (e: Event) => void,
  shouldListen?: boolean
) {
  const listenerRef = useLiveRef(listener);

  React.useEffect(() => {
    if (!shouldListen) return undefined;

    const handleEvent = (e: MouseEvent) => {
      if (!listenerRef.current) return;

      const element = targetRef.current;
      const disclosures = disclosuresRef.current || [];
      const target = e.target as Element;

      warning(
        !element,
        "Dialog",
        "Can't detect events outside dialog because `ref` wasn't passed to component.",
        "See https://reakit.io/docs/dialog"
      );

      // Click inside
      if (!element || element.contains(target)) return;

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

      listenerRef.current(e);
    };

    document.addEventListener(event, handleEvent, true);

    return () => {
      document.removeEventListener(event, handleEvent, true);
    };
  }, [
    targetRef,
    disclosuresRef,
    nestedDialogs,
    event,
    shouldListen,
    listenerRef
  ]);
}
