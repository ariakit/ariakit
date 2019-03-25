import * as React from "react";
import { useLiveRef } from "../../__utils/useLiveRef";

export function useEventListenerOutside<T extends keyof DocumentEventMap>(
  targetRef: React.RefObject<HTMLElement>,
  event: T,
  listener: (e: DocumentEventMap[T]) => void,
  shouldListen?: boolean
) {
  const listenerRef = useLiveRef(listener);

  React.useEffect(() => {
    if (!shouldListen) return undefined;

    const handleEvent = (e: MouseEvent) => {
      const element = targetRef.current;
      if (!element || element.contains(e.target as Element)) return;
      listenerRef.current(e);
    };

    document.addEventListener(event, handleEvent, true);

    return () => {
      document.removeEventListener(event, handleEvent, true);
    };
  }, [targetRef, event, shouldListen]);
}
