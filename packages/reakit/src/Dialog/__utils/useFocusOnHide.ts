import * as React from "react";
import { useUpdateEffect } from "reakit-utils/useUpdateEffect";
import { warning } from "reakit-warning";
import { isTabbable, ensureFocus } from "reakit-utils/tabbable";
import { getActiveElement } from "reakit-utils/getActiveElement";
import { DialogOptions } from "../Dialog";

function hidByFocusingAnotherElement(dialogRef: React.RefObject<HTMLElement>) {
  const dialog = dialogRef.current;

  if (!dialog) return false;

  const activeElement = getActiveElement(dialog);

  if (!activeElement) return false;
  if (dialog.contains(activeElement)) return false;
  if (isTabbable(activeElement)) return true;
  if (activeElement.getAttribute("data-dialog") === "true") return true;

  return false;
}

export function useFocusOnHide(
  dialogRef: React.RefObject<HTMLElement>,
  disclosuresRef: React.RefObject<HTMLElement[]>,
  options: DialogOptions
) {
  const shouldFocus = options.unstable_autoFocusOnHide && !options.visible;

  useUpdateEffect(() => {
    if (!shouldFocus) return;

    // Hide was triggered by a click/focus on a tabbable element outside
    // the dialog or on another dialog. We won't change focus then.
    if (hidByFocusingAnotherElement(dialogRef)) {
      return;
    }

    const finalFocusEl =
      (options.unstable_finalFocusRef &&
        options.unstable_finalFocusRef.current) ||
      (disclosuresRef.current && disclosuresRef.current[0]);

    if (finalFocusEl) {
      ensureFocus(finalFocusEl);
    } else {
      warning(
        true,
        "Can't return focus after closing dialog. Either render a disclosure component or provide a `unstable_finalFocusRef` prop.",
        "See https://reakit.io/docs/dialog",
        dialogRef.current
      );
    }
  }, [dialogRef, disclosuresRef, shouldFocus]);
}
