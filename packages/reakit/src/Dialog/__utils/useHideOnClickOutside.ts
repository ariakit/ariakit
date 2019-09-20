import * as React from "react";
import { DialogOptions } from "../Dialog";
import { useEventListenerOutside } from "./useEventListenerOutside";

export function useHideOnClickOutside(
  dialogRef: React.RefObject<HTMLElement>,
  disclosuresRef: React.RefObject<HTMLElement[]>,
  nestedDialogs: Array<React.RefObject<HTMLElement>>,
  options: DialogOptions
) {
  useEventListenerOutside(
    dialogRef,
    disclosuresRef,
    nestedDialogs,
    "click",
    options.hide,
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
