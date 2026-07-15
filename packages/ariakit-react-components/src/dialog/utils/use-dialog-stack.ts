import { useForceUpdate, useSafeLayoutEffect } from "@ariakit/react-utils";
import { contains, getDocument } from "@ariakit/utils";
import { useCallback, useMemo, useRef } from "react";

interface DialogStackEntry {
  dialog: HTMLElement;
  backdrop: HTMLElement | null;
}

interface DialogStack {
  dialogs: DialogStackEntry[];
  listeners: Set<() => void>;
}

const dialogStacks = new WeakMap<Document, DialogStack>();
const emptyElements: HTMLElement[] = [];

function getDialogStack(dialog: HTMLElement) {
  const doc = getDocument(dialog);
  const existingStack = dialogStacks.get(doc);
  if (existingStack) return existingStack;
  const stack: DialogStack = { dialogs: [], listeners: new Set() };
  dialogStacks.set(doc, stack);
  return stack;
}

function updateDialogStack(stack: DialogStack) {
  for (const listener of stack.listeners) {
    listener();
  }
}

export function useDialogStack(
  dialog: HTMLElement | null | undefined,
  enabled: boolean,
) {
  const [stackUpdated, forceUpdate] = useForceUpdate();
  const entryRef = useRef<DialogStackEntry | null>(null);
  const backdropRef = useRef<HTMLElement | null>(null);

  const removeEntry = useCallback(() => {
    const entry = entryRef.current;
    if (!entry) return;
    entryRef.current = null;
    const doc = getDocument(entry.dialog);
    const stack = dialogStacks.get(doc);
    if (!stack) return;
    stack.listeners.delete(forceUpdate);
    const index = stack.dialogs.indexOf(entry);
    if (index >= 0) {
      stack.dialogs.splice(index, 1);
    }
    updateDialogStack(stack);
    if (stack.dialogs.length === 0) {
      dialogStacks.delete(doc);
    }
  }, [forceUpdate]);

  const setBackdrop = useCallback((backdrop: HTMLElement | null) => {
    backdropRef.current = backdrop;
    const entry = entryRef.current;
    if (!entry) return;
    if (entry.backdrop === backdrop) return;
    entry.backdrop = backdrop;
    const stack = dialogStacks.get(getDocument(entry.dialog));
    if (!stack) return;
    updateDialogStack(stack);
  }, []);

  // Keep the entry for the lifetime of this opening so replacing the dialog
  // element doesn't change its position in the stack.
  useSafeLayoutEffect(() => {
    if (!enabled) return;
    return removeEntry;
  }, [enabled, removeEntry]);

  useSafeLayoutEffect(() => {
    if (!enabled) return;
    if (!dialog) return;
    const entry = entryRef.current;
    if (entry) {
      const previousDocument = getDocument(entry.dialog);
      const nextDocument = getDocument(dialog);
      const stack = dialogStacks.get(previousDocument);
      if (stack && previousDocument === nextDocument) {
        if (entry.dialog === dialog) return;
        entry.dialog = dialog;
        updateDialogStack(stack);
        return;
      }
      removeEntry();
    }
    const stack = getDialogStack(dialog);
    const nextEntry = { dialog, backdrop: backdropRef.current };
    entryRef.current = nextEntry;
    stack.dialogs.push(nextEntry);
    updateDialogStack(stack);
    stack.listeners.add(forceUpdate);
  }, [dialog, enabled, forceUpdate, removeEntry]);

  const stackedElements = useMemo(() => {
    // The registry lives outside React, so read its update signal here to
    // invalidate the derived array only when the stack changes.
    void stackUpdated;
    if (!enabled) return emptyElements;
    if (!dialog) return emptyElements;
    const entry = entryRef.current;
    if (!entry) return emptyElements;
    const stack = dialogStacks.get(getDocument(dialog));
    if (!stack) return emptyElements;
    const index = stack.dialogs.indexOf(entry);
    if (index < 0) return emptyElements;
    // Inline nested dialogs register before their DOM ancestors, which are
    // behind the current dialog rather than later dialogs in the stack.
    const elements = stack.dialogs
      .slice(index + 1)
      .filter((entry) => !contains(entry.dialog, dialog))
      .flatMap(({ dialog, backdrop }) =>
        backdrop ? [dialog, backdrop] : [dialog],
      );
    return elements.length ? elements : emptyElements;
  }, [dialog, enabled, stackUpdated]);

  return [stackedElements, setBackdrop] as const;
}
