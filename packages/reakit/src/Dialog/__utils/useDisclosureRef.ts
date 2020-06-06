import * as React from "react";
import { getDocument } from "reakit-utils/getDocument";
import { DialogOptions } from "../Dialog";

export function useDisclosureRef(
  dialogRef: React.RefObject<HTMLElement>,
  options: DialogOptions
) {
  const ref = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (options.visible) return undefined;
    // We get the last focused element before the dialog opens, so we can move
    // focus back to it when the dialog closes.
    const onFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      ref.current = target;
      if (options.unstable_disclosureRef) {
        options.unstable_disclosureRef.current = target;
      }
    };
    const document = getDocument(dialogRef.current);
    document.addEventListener("focus", onFocus, true);
    return () => {
      document.removeEventListener("focus", onFocus, true);
    };
  }, [options.visible, options.unstable_disclosureRef, dialogRef]);

  React.useEffect(() => {
    if (!options.visible) return undefined;
    // Safari and Firefox on MacOS don't focus on buttons on mouse down.
    // Instead, they focus on the closest focusable parent (ultimately, the
    // body element). This works around that by preventing that behavior and
    // forcing focus on the disclosure button. Otherwise, we wouldn't be able
    // to close the dialog by clicking again on the disclosure.
    const onMouseDown = (event: MouseEvent) => {
      const element = event.currentTarget as HTMLElement;
      event.preventDefault();
      element.focus();
    };
    const disclosure = options.unstable_disclosureRef?.current || ref.current;
    disclosure?.addEventListener("mousedown", onMouseDown);
    return () => disclosure?.removeEventListener("mousedown", onMouseDown);
  }, [options.visible, options.unstable_disclosureRef]);

  return options.unstable_disclosureRef || ref;
}
