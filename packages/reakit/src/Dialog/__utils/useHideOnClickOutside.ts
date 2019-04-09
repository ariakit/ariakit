import * as React from "react";
import { DialogOptions } from "../Dialog";
import { useEventListenerOutside } from "./useEventListenerOutside";

export function useHideOnClickOutside(
  portalRef: React.RefObject<HTMLElement>,
  disclosureRef: React.RefObject<HTMLElement>,
  nestedDialogs: Array<React.RefObject<HTMLElement>>,
  options: DialogOptions
) {
  return useEventListenerOutside(
    portalRef,
    disclosureRef,
    nestedDialogs,
    "click",
    options.hide,
    options.visible && options.hideOnClickOutside
  );
}
