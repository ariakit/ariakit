import { useCallback, useEffect } from "react";
import { getDocument } from "@ariakit/core/utils/dom";
import { flushSync } from "react-dom";
import { useForceUpdate } from "../../utils/hooks.js";
import type { DialogStore } from "../dialog-store.js";

/**
 * Controls which dialog is the champion that will control global behavior such
 * as body scrolling and accessibility tree outside.
 */
export function useChampionDialog(
  attribute: string,
  store: DialogStore,
  enabled?: boolean
) {
  const [updated, retry] = useForceUpdate();

  const isChampionDialog = useCallback(() => {
    if (!enabled) return false;
    const dialog = store.getState().contentElement;
    if (!dialog) return false;
    const { body } = getDocument(dialog);
    const id = body.getAttribute(attribute);
    return !id || id === dialog.id;
  }, [updated, store, enabled, attribute]);

  useEffect(() => {
    const dialog = store.getState().contentElement;
    if (!dialog) return;
    if (!enabled) return;
    const { body } = getDocument(dialog);

    // If the dialog is not the champion, there may be another dialog that will
    // be closed soon, which will remove the champion attribute from the body.
    // We observe this change and retry to see if this dialog is now the
    // champion.
    if (!isChampionDialog()) {
      const observer = new MutationObserver(() => flushSync(retry));
      observer.observe(body, { attributeFilter: [attribute] });
      return () => observer.disconnect();
    }

    body.setAttribute(attribute, dialog.id);
    return () => {
      body.removeAttribute(attribute);
    };
  }, [updated, store, enabled, isChampionDialog, attribute]);

  return isChampionDialog;
}
