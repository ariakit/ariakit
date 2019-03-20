import * as React from "react";

import { getFirstTabbableIn } from "./tabbable";

function hasNestedOpenDialogs(portal: Element) {
  return portal.querySelectorAll("[data-dialog][aria-hidden=false]").length > 1;
}

export function useFocusOnShow(
  dialogRef: React.RefObject<HTMLElement>,
  portalRef: React.RefObject<HTMLElement>,
  initialFocusRef?: React.RefObject<HTMLElement>,
  shouldFocus?: boolean
) {
  React.useEffect(() => {
    const dialog = dialogRef.current;
    const portal = portalRef.current;

    // If there're nested open dialogs, let them handle focus
    if (!shouldFocus || !dialog || !portal || hasNestedOpenDialogs(portal)) {
      return;
    }

    if (initialFocusRef && initialFocusRef.current) {
      initialFocusRef.current.focus();
    } else {
      const tabbable = getFirstTabbableIn(dialog, true);
      if (tabbable) {
        tabbable.focus();
      } else {
        dialog.focus();
      }
    }
  }, [dialogRef, initialFocusRef, shouldFocus]);
}
