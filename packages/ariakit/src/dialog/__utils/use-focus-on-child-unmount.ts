import { RefObject, useEffect } from "react";
import { getActiveElement, getDocument } from "ariakit-utils/dom";
import { DialogState } from "../dialog-state";

/**
 * When the focused child gets removed from the DOM, we make sure to move focus
 * to the dialog.
 */
export function useFocusOnChildUnmount(
  dialogRef: RefObject<HTMLElement>,
  state: DialogState
) {
  useEffect(() => {
    if (!state.visible) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const observer = new MutationObserver(([mutation]) => {
      if (!mutation) return;
      // If target is not dialog, then this observer was triggered by a nested
      // dialog, so we just ignore it here and let the nested dialog handle it.
      if (mutation.target !== dialog) return;
      const document = getDocument(dialog);
      const activeElement = getActiveElement(dialog);
      // We can check if the current focused element is the document body.
      if (activeElement === document.body) {
        dialog.focus();
      }
    });

    observer.observe(dialog, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [state.visible, dialogRef]);
}
