import * as React from "react";
import { DialogOptions } from "../Dialog";
import { useEventListenerOutside } from "./useEventListenerOutside";

export function useHideOnClickOutside(
  dialogRef: React.RefObject<HTMLElement>,
  disclosuresRef: React.RefObject<HTMLElement[]>,
  nestedDialogs: Array<React.RefObject<HTMLElement>>,
  options: DialogOptions
) {
  const useEvent = (eventType: string) =>
    useEventListenerOutside(
      dialogRef,
      disclosuresRef,
      nestedDialogs,
      eventType,
      options.hide,
      options.visible && options.hideOnClickOutside
    );
  useEvent("click");
  useEvent("focus");
}
