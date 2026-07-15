import { useForceUpdate, useSafeLayoutEffect } from "@ariakit/react-utils";
import { contains, getDocument } from "@ariakit/utils";
import { useMemo } from "react";

interface DialogStack {
  dialogs: HTMLElement[];
  listeners: Set<() => void>;
}

const dialogStacks = new WeakMap<Document, DialogStack>();

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

  useSafeLayoutEffect(() => {
    if (!enabled) return;
    if (!dialog) return;
    const stack = getDialogStack(dialog);
    stack.dialogs.push(dialog);
    updateDialogStack(stack);
    stack.listeners.add(forceUpdate);
    return () => {
      stack.listeners.delete(forceUpdate);
      const index = stack.dialogs.indexOf(dialog);
      if (index >= 0) {
        stack.dialogs.splice(index, 1);
      }
      updateDialogStack(stack);
      if (stack.dialogs.length === 0) {
        dialogStacks.delete(getDocument(dialog));
      }
    };
  }, [dialog, enabled, forceUpdate]);

  return useMemo(() => {
    // The registry lives outside React, so read its update signal here to
    // invalidate the derived array only when the stack changes.
    void stackUpdated;
    if (!enabled) return [];
    if (!dialog) return [];
    const stack = dialogStacks.get(getDocument(dialog));
    if (!stack) return [];
    const index = stack.dialogs.indexOf(dialog);
    if (index < 0) return [];
    // Inline nested dialogs register before their DOM ancestors, which are
    // behind the current dialog rather than later dialogs in the stack.
    return stack.dialogs
      .slice(index + 1)
      .filter((stackedDialog) => !contains(stackedDialog, dialog));
  }, [dialog, enabled, stackUpdated]);
}
