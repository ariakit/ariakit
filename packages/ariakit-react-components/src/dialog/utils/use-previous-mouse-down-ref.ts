import { useEffect, useRef } from "react";
import { addFrameTreeEventListener } from "./__frame-events.ts";
import type { RegisterFrameTreeListener } from "./__frame-events.ts";

export function usePreviousMouseDownRef(
  enabled?: boolean,
  scope?: Window,
  registerFrameTreeListener?: RegisterFrameTreeListener,
) {
  const previousMouseDownRef = useRef<EventTarget | null>(null);

  useEffect(() => {
    if (!enabled) {
      previousMouseDownRef.current = null;
      return;
    }
    if (!scope) return;
    if (!registerFrameTreeListener) return;
    const onMouseDown = (event: MouseEvent) => {
      previousMouseDownRef.current = event.target;
    };
    return registerFrameTreeListener((eventScope) =>
      addFrameTreeEventListener({
        type: "mousedown",
        listener: onMouseDown,
        options: true,
        scope: eventScope,
      }),
    );
  }, [enabled, scope, registerFrameTreeListener]);

  return previousMouseDownRef;
}
