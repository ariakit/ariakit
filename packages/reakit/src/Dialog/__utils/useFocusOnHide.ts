import * as React from "react";

import { isTabbable } from "./tabbable";

export function useFocusOnHide(
  dialogRef: React.RefObject<HTMLElement>,
  finalFocusRef?: React.RefObject<HTMLElement>,
  shouldFocus?: boolean
) {
  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !shouldFocus) return;

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
