import * as React from "react";
import { DialogOptions } from "../Dialog";
import { useEventListenerOutside } from "./useEventListenerOutside";

export function useHideOnClickOutside(
  dialogRef: React.RefObject<HTMLElement>,
  disclosuresRef: React.RefObject<HTMLElement[]>,
  nestedDialogs: Array<React.RefObject<HTMLElement>>,
  options: DialogOptions
) {
  const mouseDownRef = React.useRef<EventTarget | null>();

  useEventListenerOutside(
    dialogRef,
    disclosuresRef,
    nestedDialogs,
    "mousedown",
    event => {
      mouseDownRef.current = event.target;
    },
    options.visible && options.hideOnClickOutside
  );

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
