import * as React from "react";
import { useUpdateEffect } from "../../__utils/useUpdateEffect";
import { DialogOptions } from "../Dialog";
import { warning } from "../../__utils/warning";
import { getFirstTabbableIn } from "./tabbable";

export function useFocusOnShow(
  dialogRef: React.RefObject<HTMLElement>,
  nestedDialogs: Array<React.RefObject<HTMLElement>>,
  options: DialogOptions
) {
  const initialFocusRef = options.unstable_initialFocusRef;
  const shouldFocus = options.visible && options.unstable_autoFocusOnShow;

  useUpdateEffect(() => {
    const dialog = dialogRef.current;

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
          "It's recommended to have at least one tabbable element inside dialog. The dialog element has been automatically focused. If this is the intended behavior, pass `tabIndex={0}` to disable this warning. See https://reakit.io/docs/dialog",
          "Dialog"
        );
      }
    }
  }, [dialogRef, initialFocusRef, shouldFocus, nestedDialogs]);
}
