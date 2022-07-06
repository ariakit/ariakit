import { RefObject, useCallback } from "react";
import { getDocument } from "ariakit-utils/dom";
import { useForceUpdate, useSafeLayoutEffect } from "ariakit-utils/hooks";
import { flushSync } from "react-dom";

/**
 * Controls which dialog is the champion that will control global behavior such
 * as body scrolling and accessibility tree outside.
 */
export function useChampionDialog(
  dialogRef: RefObject<HTMLElement>,
  attribute: string,
  enabled?: boolean
) {
  const [updated, retry] = useForceUpdate();

  const isChampionDialog = useCallback(() => {
    if (!enabled) return false;
    const dialog = dialogRef.current;
    if (!dialog) return false;
    const { body } = getDocument(dialog);
    const id = body.getAttribute(attribute);
    return !id || id === dialog.id;
  }, [updated, enabled, attribute]);

  useSafeLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!enabled) return;
    const { body } = getDocument(dialog);

    if (!isChampionDialog()) {
      const observer = new MutationObserver(() => flushSync(retry));
      observer.observe(body, { attributeFilter: [attribute] });
      return () => observer.disconnect();
    }

    body.setAttribute(attribute, dialog.id);
    return () => {
      body.removeAttribute(attribute);
    };
  }, [updated, dialogRef, enabled, isChampionDialog, attribute]);

  return isChampionDialog;
}
