import * as React from "react";
import { unstable_DialogOptions } from "../Dialog";
import { useEventListenerOutside } from "./useEventListenerOutside";

export function useHideOnFocusOutside(
  dialogRef: React.RefObject<HTMLElement>,
  disclosureRef: React.RefObject<HTMLElement>,
  nestedDialogs: Array<React.RefObject<HTMLElement>>,
  options: unstable_DialogOptions
) {
  return useEventListenerOutside(
    dialogRef,
    disclosureRef,
    nestedDialogs,
    "focus",
    options.hide,
    options.visible &&
      options.unstable_hideOnClickOutside &&
      !options.unstable_modal
  );
}
