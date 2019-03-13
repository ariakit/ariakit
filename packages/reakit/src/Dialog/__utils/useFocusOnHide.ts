import * as React from "react";
import { isTabbable } from "./tabbable";

export function useFocusOnHide(
  dialogRef: React.RefObject<HTMLElement>,
  disclosureRef: React.RefObject<HTMLElement>,
  elementToFocus?: React.RefObject<HTMLElement>,
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

    if (elementToFocus && elementToFocus.current) {
      elementToFocus.current.focus();
    } else if (disclosureRef.current) {
      disclosureRef.current.focus();
    }
  }, [dialogRef, disclosureRef, elementToFocus, shouldFocus]);
}
