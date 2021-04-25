import * as React from "react";
import { getNextActiveElementOnBlur } from "reakit-utils/events";
import { useSafeLayoutEffect } from "reakit-utils/hooks";
import { getDocument, getActiveElement } from "reakit-utils/dom";
import { warning } from "reakit-warning";
import { DialogOptions } from "../Dialog";

function isActualElement(element?: Element | null) {
  return (
    element &&
    element.tagName &&
    element.tagName !== "HTML" &&
    element !== getDocument(element).body
  );
}

export function useFocusOnBlur(
  dialogRef: React.RefObject<HTMLElement>,
  options: DialogOptions
) {
  const [blurred, scheduleFocus] = React.useReducer((n: number) => n + 1, 0);

  useSafeLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!options.visible) return;
    if (!blurred) return;
    // After blur, if the active element isn't an actual element, this probably
    // means that element.blur() was called on an element inside the dialog.
    // In this case, the browser will automatically focus the body element.
    // So we move focus back to the dialog.
    if (!isActualElement(getActiveElement(dialog))) {
      warning(
        !dialog,
        "Can't focus dialog after a nested element got blurred because `ref` wasn't passed to the component",
        "See https://reakit.io/docs/dialog"
      );
      dialog?.focus();
    }
  }, [blurred, dialogRef]);

  const onBlur = React.useCallback(
    (event: React.FocusEvent<HTMLElement>) => {
      if (!options.visible) return;
      const nextActiveElement = getNextActiveElementOnBlur(event);
      if (!isActualElement(nextActiveElement)) {
        scheduleFocus();
      }
    },
    [options.visible]
  );

  return onBlur;
}
