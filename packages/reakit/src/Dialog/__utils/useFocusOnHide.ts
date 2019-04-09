import * as React from "react";
import { useUpdateEffect } from "../../__utils/useUpdateEffect";
import { DialogOptions } from "../Dialog";
import { isTabbable } from "./tabbable";

export function useFocusOnHide(
  dialogRef: React.RefObject<HTMLElement>,
  disclosureRef: React.RefObject<HTMLElement>,
  options: DialogOptions
) {
  const finalFocusRef = options.unstable_finalFocusRef || disclosureRef;
  const shouldFocus = options.unstable_autoFocusOnHide && !options.visible;

  useUpdateEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !shouldFocus) return;

    // Hide was triggered by a click/focus on a tabbable element outside
    // the dialog. We won't change focus then.
    if (
      document.activeElement &&
      !dialog.contains(document.activeElement) &&
      isTabbable(document.activeElement)
    ) {
      return;
    }

    if (finalFocusRef && finalFocusRef.current) {
      finalFocusRef.current.focus();
    }
  }, [dialogRef, finalFocusRef, shouldFocus]);
}
