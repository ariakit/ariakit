import { useCallback, useEffect } from "react";
import { getDocument } from "@ariakit/core/utils/dom";
import { flushSync } from "react-dom";
import { useForceUpdate } from "../../utils/hooks.js";
import type { DialogStore } from "../dialog-store.js";

export function useRootDialog(
  attribute: string,
  store: DialogStore,
  enabled?: boolean
) {
  const [updated, retry] = useForceUpdate();

  const isRootDialog = useCallback(() => {
    if (!enabled) return false;
    const dialog = store.getState().contentElement;
    if (!dialog) return false;
    const { body } = getDocument(dialog);
    const id = body.getAttribute(attribute);
    return !id || id === dialog.id;
  }, [updated, store, enabled, attribute]);

  useEffect(() => {
    if (!enabled) return;
    const dialog = store.getState().contentElement;
    if (!dialog) return;
    const { body } = getDocument(dialog);
    if (isRootDialog()) {
      body.setAttribute(attribute, dialog.id);
      return () => body.removeAttribute(attribute);
    }
    // If the dialog is not the root, there may be another dialog that will be
    // closed soon, which will remove the root attribute from the body. We
    // observe this change and retry to see if this dialog is now the root.
    const observer = new MutationObserver(() => flushSync(retry));
    observer.observe(body, { attributeFilter: [attribute] });
    return () => observer.disconnect();
  }, [updated, enabled, store, isRootDialog, attribute]);

  return isRootDialog;
}
