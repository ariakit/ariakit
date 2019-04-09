import * as React from "react";
import { useUpdateEffect } from "../../__utils/useUpdateEffect";
import { unstable_DialogOptions } from "../Dialog";
import { getFirstTabbableIn } from "./tabbable";

export function useFocusOnShow(
  dialogRef: React.RefObject<HTMLElement>,
  nestedDialogs: Array<React.RefObject<HTMLElement>>,
  options: unstable_DialogOptions
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
      initialFocusRef.current.focus();
    } else {
      const tabbable = getFirstTabbableIn(dialog, true);
      if (tabbable) {
        tabbable.focus();
      } else {
        dialog.focus();
      }
    }
  }, [dialogRef, initialFocusRef, shouldFocus, nestedDialogs]);
}
