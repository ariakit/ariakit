import { useEffect, useRef } from "react";
import { addGlobalEventListener } from "ariakit-utils/events";

export function usePreviousMouseDownRef(enabled?: boolean) {
  const previousMouseDownRef = useRef<EventTarget | null>();

  useEffect(() => {
    if (!enabled) return;
    const onMouseDown = (event: MouseEvent) => {
      previousMouseDownRef.current = event.target;
    };
    return addGlobalEventListener("mousedown", onMouseDown);
  }, [enabled]);

  return previousMouseDownRef;
}
