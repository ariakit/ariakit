import { useCallback, useEffect } from "react";
import { getDocument } from "@ariakit/core/utils/dom";
import { flushSync } from "react-dom";
import { useForceUpdate } from "../../utils/hooks.js";

interface Props {
  attribute: string;
  contentId?: string;
  contentElement?: HTMLElement | null;
  enabled?: boolean;
}

export function useRootDialog({
  attribute,
  contentId,
  contentElement,
  enabled,
}: Props) {
  const [updated, retry] = useForceUpdate();

  const isRootDialog = useCallback(() => {
    if (!enabled) return false;
    if (!contentElement) return false;
    const { body } = getDocument(contentElement);
    const id = body.getAttribute(attribute);
    return !id || id === contentId;
  }, [updated, enabled, contentElement, attribute, contentId]);

  useEffect(() => {
    if (!enabled) return;
    if (!contentId) return;
    if (!contentElement) return;
    const { body } = getDocument(contentElement);
    if (isRootDialog()) {
      body.setAttribute(attribute, contentId);
      return () => body.removeAttribute(attribute);
    }
    // If the dialog is not the root, there may be another dialog that will be
    // closed soon, which will remove the root attribute from the body. We
    // observe this change and retry to see if this dialog is now the root.
    const observer = new MutationObserver(() => flushSync(retry));
    observer.observe(body, { attributeFilter: [attribute] });
    return () => observer.disconnect();
  }, [updated, enabled, contentId, contentElement, isRootDialog, attribute]);

  return isRootDialog;
}
