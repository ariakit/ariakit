import { addGlobalEventListener } from "@ariakit/core/utils/events";
import { useEffect, useRef } from "react";

export function usePreviousMouseDownRef(enabled?: boolean, scope?: Window) {
  const previousMouseDownRef = useRef<EventTarget | null>(null);

  useEffect(() => {
    if (!enabled) {
      previousMouseDownRef.current = null;
      return;
    }
    const onMouseDown = (event: MouseEvent) => {
      previousMouseDownRef.current = event.target;
    };
    return addGlobalEventListener("mousedown", onMouseDown, true, scope);
  }, [enabled, scope]);

  return previousMouseDownRef;
}
