import * as React from "react";

export function useEventListenerOutside<T extends keyof DocumentEventMap>(
  targetRef: React.RefObject<HTMLElement>,
  event: T,
  listener: (e: DocumentEventMap[T]) => void,
  shouldListen?: boolean
) {
  React.useEffect(() => {
    const element = targetRef.current;

    if (!element || !shouldListen) return undefined;

    const handleEvent = (e: MouseEvent) => {
      if (!targetRef.current || targetRef.current.contains(e.target as Element))
        return;
      listener(e);
    };

    document.addEventListener(event, handleEvent, true);

    return () => {
      document.removeEventListener(event, handleEvent, true);
    };
  }, [targetRef, event, listener, shouldListen]);
}
