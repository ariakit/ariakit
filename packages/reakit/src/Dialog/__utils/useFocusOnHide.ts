import * as React from "react";
import { useUpdateEffect } from "reakit-utils/useUpdateEffect";
import { warning } from "reakit-utils/warning";
import { isTabbable, forceFocus } from "reakit-utils/tabbable";
import { DialogOptions } from "../Dialog";

export function useFocusOnHide(
  dialogRef: React.RefObject<HTMLElement>,
  disclosuresRef: React.RefObject<HTMLElement[]>,
  options: DialogOptions
) {
  const shouldFocus = options.unstable_autoFocusOnHide && !options.visible;

  useUpdateEffect(() => {
    if (!shouldFocus) return;
    const dialog = dialogRef.current;

    // Hide was triggered by a click/focus on a tabbable element outside
    // the dialog or on another dialog. We won't change focus then.
    if (
      document.activeElement &&
      dialog &&
      !dialog.contains(document.activeElement) &&
      (isTabbable(document.activeElement) ||
        document.activeElement.getAttribute("data-dialog") === "true")
    ) {
      return;
    }

    const finalFocusEl =
      (options.unstable_finalFocusRef &&
        options.unstable_finalFocusRef.current) ||
      (disclosuresRef.current && disclosuresRef.current[0]);

    if (finalFocusEl) {
      forceFocus(finalFocusEl);
    } else {
      warning(
        true,
        "Dialog",
        "Can't return focus after closing dialog. Either render a disclosure component or provide a `unstable_finalFocusRef` prop.",
        "See https://reakit.io/docs/dialog"
      );
    }
  }, [dialogRef, disclosuresRef, shouldFocus]);
}
