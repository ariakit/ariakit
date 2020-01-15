import * as React from "react";
import { getDocument } from "reakit-utils/getDocument";
import { DialogOptions } from "../Dialog";
import { useEventListenerOutside } from "./useEventListenerOutside";

export function useHideOnClickOutside(
  dialogRef: React.RefObject<HTMLElement>,
  disclosuresRef: React.RefObject<HTMLElement[]>,
  nestedDialogs: Array<React.RefObject<HTMLElement>>,
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

  useEventListenerOutside(
    dialogRef,
    disclosuresRef,
    nestedDialogs,
    "click",
    event => {
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
