import { addGlobalEventListener, isElement } from "@ariakit/utils";
import { useEffect, useRef } from "react";

export function getEventTarget(event: Event) {
  return event.composedPath().find(isElement) || event.target;
}

export function usePreviousMouseDownRef(enabled?: boolean, scope?: Window) {
  const previousMouseDownRef = useRef<EventTarget | null>(null);

  useEffect(() => {
    if (!enabled) {
      previousMouseDownRef.current = null;
      return;
    }
    const onMouseDown = (event: MouseEvent) => {
      previousMouseDownRef.current = getEventTarget(event);
    };
    return addGlobalEventListener("mousedown", onMouseDown, true, scope);
  }, [enabled, scope]);

  return previousMouseDownRef;
}
