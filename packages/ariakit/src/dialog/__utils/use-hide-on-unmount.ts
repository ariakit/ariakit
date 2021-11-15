import { RefObject, useEffect } from "react";
import { DialogState } from "../dialog-state";

export function useHideOnUnmount(
  dialogRef: RefObject<HTMLElement>,
  state: DialogState
) {
  // Hides the dialog in the state when the component gets unmounted.
  useEffect(() => {
    const element = dialogRef.current;
    // If the ref isn't set in the first place, we don't need to do anything.
    // This can be the case when the useDialog hook is used, but the props are
    // not passed to any element.
    if (!element) return;
    return () => {
      if (!dialogRef.current) {
        state.hide();
      }
    };
  }, [dialogRef, state.hide]);
}
