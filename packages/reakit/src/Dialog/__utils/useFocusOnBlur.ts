import * as React from "react";
import { getNextActiveElementOnBlur } from "reakit-utils/getNextActiveElementOnBlur";
import { useIsomorphicEffect } from "reakit-utils/useIsomorphicEffect";
import { getDocument } from "reakit-utils/getDocument";
import { getActiveElement } from "reakit-utils/getActiveElement";
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

  useIsomorphicEffect(() => {
    const dialog = dialogRef.current;
    if (!options.visible) return;
    if (!blurred) return;
    const activeElement = getActiveElement(dialog);
    if (!isActualElement(activeElement)) {
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
