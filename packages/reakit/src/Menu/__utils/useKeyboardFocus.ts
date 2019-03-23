import * as React from "react";

export function useKeyboardFocus(
  targetRef: React.RefObject<HTMLElement>,
  handler: (event?: FocusEvent) => void,
  enabled?: boolean
) {
  const handlerRef = React.useRef(handler);
  const lastMouseDown = React.useRef<EventTarget | null>();

  React.useEffect(() => {
    handlerRef.current = handler;
  });

  React.useEffect(() => {
    if (!enabled || !targetRef.current) return undefined;

    const handleFocus = (event: FocusEvent) => {
      if (event.target !== lastMouseDown.current) {
        handlerRef.current(event);
      }
    };

    const handleBlur = () => {
      lastMouseDown.current = null;
    };

    const handleMouseDown = (event: MouseEvent | TouchEvent) => {
      lastMouseDown.current = event.target;
    };

    targetRef.current.addEventListener("focus", handleFocus);
    targetRef.current.addEventListener("blur", handleBlur);

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("touchstart", handleMouseDown);
    return () => {
      if (targetRef.current) {
        targetRef.current.removeEventListener("focus", handleFocus);
        targetRef.current.removeEventListener("blur", handleBlur);
      }
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("touchstart", handleMouseDown);
    };
  }, []);
}
