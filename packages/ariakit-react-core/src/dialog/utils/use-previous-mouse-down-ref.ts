import { useEffect, useRef } from "react";
import { addGlobalEventListener } from "@ariakit/core/utils/events";

export function usePreviousMouseDownRef(enabled?: boolean) {
  const previousMouseDownRef = useRef<EventTarget | null>();

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
