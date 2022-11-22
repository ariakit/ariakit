import { useCallback } from "react";
import { getDocument } from "@ariakit/core/utils/dom";
import {
  useForceUpdate,
  useSafeLayoutEffect,
} from "@ariakit/react-core/utils/hooks";
import { flushSync } from "react-dom";
import { DialogStore } from "../dialog-store";

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

  useSafeLayoutEffect(() => {
    const dialog = store.getState().contentElement;
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
  }, [updated, store, enabled, isChampionDialog, attribute]);

  return isChampionDialog;
}
