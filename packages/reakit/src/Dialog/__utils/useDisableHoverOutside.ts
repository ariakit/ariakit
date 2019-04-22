import * as React from "react";
import { DialogOptions } from "../Dialog";
import { useEventListenerOutside } from "./useEventListenerOutside";

export function useDisableHoverOutside(
  portalRef: React.RefObject<HTMLElement>,
  nestedDialogs: Array<React.RefObject<HTMLElement>>,
  options: DialogOptions
) {
  return useEventListenerOutside(
    portalRef,
    { current: null },
    nestedDialogs,
    "mouseover",
    event => {
      event.stopPropagation();
      event.preventDefault();
    },
    options.visible && options.modal
  );
}
