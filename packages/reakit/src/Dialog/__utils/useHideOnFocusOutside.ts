import * as React from "react";
import { DialogOptions } from "../Dialog";
import { useEventListenerOutside } from "./useEventListenerOutside";

export function useHideOnFocusOutside(
  dialogRef: React.RefObject<HTMLElement>,
  disclosureRef: React.RefObject<HTMLElement>,
  nestedDialogs: Array<React.RefObject<HTMLElement>>,
  options: DialogOptions
) {
  return useEventListenerOutside(
    dialogRef,
    disclosureRef,
    nestedDialogs,
    "focus",
    options.hide,
    options.visible && options.hideOnClickOutside && !options.modal
  );
}
