import * as React from "react";
import { DialogOptions } from "../Dialog";
import { useEventListenerOutside } from "./useEventListenerOutside";

export function useHideOnClickOutside(
  dialogRef: React.RefObject<HTMLElement>,
  disclosureRef: React.RefObject<HTMLElement>,
  nestedDialogs: Array<React.RefObject<HTMLElement>>,
  options: DialogOptions
) {
  useEventListenerOutside(
    dialogRef,
    disclosureRef,
    nestedDialogs,
    "click",
    options.hide,
    options.visible && options.hideOnClickOutside
  );
  useEventListenerOutside(
    dialogRef,
    disclosureRef,
    nestedDialogs,
    "focus",
    options.hide,
    options.visible && options.hideOnClickOutside
  );
}
