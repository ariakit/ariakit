import * as React from "react";
import { getDocument } from "reakit-utils/getDocument";
import { DialogOptions } from "../Dialog";
import { useEventListenerOutside } from "./useEventListenerOutside";

function useMouseDownRef(
  dialogRef: React.RefObject<HTMLElement>,
  options: DialogOptions
) {
  const mouseDownRef = React.useRef<EventTarget | null>();

  React.useEffect(() => {
    if (!options.visible || !options.hideOnClickOutside) {
      return undefined;
    }

    const document = getDocument(dialogRef.current);
    const onMouseDown = (event: MouseEvent) => {
      mouseDownRef.current = event.target;
    };

    document.addEventListener("mousedown", onMouseDown);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [options.visible, options.hideOnClickOutside, dialogRef]);

  return mouseDownRef;
}

export function useHideOnClickOutside(
  dialogRef: React.RefObject<HTMLElement>,
  disclosuresRef: React.RefObject<HTMLElement[]>,
  nestedDialogs: Array<React.RefObject<HTMLElement>>,
  options: DialogOptions
) {
  const mouseDownRef = useMouseDownRef(dialogRef, options);

  useEventListenerOutside(
    dialogRef,
    disclosuresRef,
    nestedDialogs,
    "click",
    event => {
      // Make sure the element that has been clicked is the same that last
      // triggered the mousedown event. This prevents the dialog from closing
      // by dragging the cursor (for example, selecting some text inside the
      // dialog and releasing the mouse outside of it).
      if (mouseDownRef.current === event.target && options.hide) {
        options.hide();
      }
    },
    options.visible && options.hideOnClickOutside
  );

  useEventListenerOutside(
    dialogRef,
    disclosuresRef,
    nestedDialogs,
    "focus",
    options.hide,
    options.visible && options.hideOnClickOutside
  );
}
