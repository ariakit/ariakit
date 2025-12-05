import { addGlobalEventListener } from "@ariakit/core/utils/events";
import { useEffect, useRef } from "react";

export function usePreviousMouseDownRef(enabled?: boolean) {
  const previousMouseDownRef = useRef<EventTarget | null>(null);

  useEffect(() => {
    if (!enabled) {
      previousMouseDownRef.current = null;
      return;
    }
    const onMouseDown = (event: MouseEvent) => {
      previousMouseDownRef.current = event.target;
    };
    return addGlobalEventListener("mousedown", onMouseDown, true);
  }, [enabled]);

  return previousMouseDownRef;
}
