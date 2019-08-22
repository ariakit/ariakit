import * as React from "react";
import { useUpdateEffect } from "reakit-utils/useUpdateEffect";
import { warning } from "reakit-utils/warning";
import { getFirstTabbableIn } from "reakit-utils/tabbable";
import { DialogOptions } from "../Dialog";

export function useFocusOnShow(
  dialogRef: React.RefObject<HTMLElement>,
  nestedDialogs: Array<React.RefObject<HTMLElement>>,
  options: DialogOptions
) {
  const initialFocusRef = options.unstable_initialFocusRef;
  const shouldFocus = options.visible && options.unstable_autoFocusOnShow;

  useUpdateEffect(() => {
    const dialog = dialogRef.current;

    warning(
      Boolean(shouldFocus && !dialog),
      "Dialog",
      "Can't set initial focus on dialog because `ref` wasn't passed to component.",
      "See https://reakit.io/docs/dialog"
    );

    // If there're nested open dialogs, let them handle focus
    if (
      !shouldFocus ||
      !dialog ||
      nestedDialogs.find(child =>
        Boolean(child.current && !child.current.hidden)
      )
    ) {
      return;
    }

    if (initialFocusRef && initialFocusRef.current) {
      initialFocusRef.current.focus({ preventScroll: true });
    } else {
      const tabbable = getFirstTabbableIn(dialog, true);
      if (tabbable) {
        tabbable.focus({ preventScroll: true });
      } else {
        dialog.focus({ preventScroll: true });
        warning(
          dialog.tabIndex === undefined || dialog.tabIndex < 0,
          "Dialog",
          "It's recommended to have at least one tabbable element inside dialog. The dialog element has been automatically focused.",
          "If this is the intended behavior, pass `tabIndex={0}` to the dialog element to disable this warning.",
          "See https://reakit.io/docs/dialog"
        );
      }
    }
  }, [dialogRef, initialFocusRef, shouldFocus, nestedDialogs]);
}
