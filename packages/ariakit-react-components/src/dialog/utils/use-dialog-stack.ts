import { useForceUpdate, useSafeLayoutEffect } from "@ariakit/react-utils";
import { contains, getDocument } from "@ariakit/utils";
import { useCallback, useMemo, useRef } from "react";
import type { DialogStore } from "../dialog-store.ts";

interface DialogStackOptions {
  portal?: HTMLElement | null;
  store?: DialogStore;
  nestedDialogs?: DialogStore[];
}

interface DialogStackEntry {
  dialog: HTMLElement;
  backdrop: HTMLElement | null;
  portal: HTMLElement | null;
  document: Document;
  activation: number;
  groupActivation: number;
  store?: DialogStore;
  nestedDialogs: DialogStore[];
}

interface DialogStack {
  dialogs: DialogStackEntry[];
  listeners: Set<() => void>;
  topologyVersion: number;
  cleanup: () => void;
}

const dialogStacks = new WeakMap<Document, DialogStack>();
const emptyElements: HTMLElement[] = [];
const emptyDialogStores: DialogStore[] = [];
let nextDialogActivation = 0;

function getDialogStack(dialog: HTMLElement) {
  const doc = getDocument(dialog);
  const existingStack = dialogStacks.get(doc);
  if (existingStack) return existingStack;
  const onFullscreenChange = () => {
    const win = doc.defaultView;
    if (!win) return;
    win.queueMicrotask(() => {
      if (dialogStacks.get(doc) !== stack) return;
      if (!stack.dialogs.some((entry) => entry.portal)) return;
      updateDialogStack(stack);
    });
  };
  const stack: DialogStack = {
    dialogs: [],
    listeners: new Set(),
    topologyVersion: 0,
    cleanup() {
      doc.removeEventListener("fullscreenchange", onFullscreenChange);
    },
  };
  doc.addEventListener("fullscreenchange", onFullscreenChange);
  dialogStacks.set(doc, stack);
  return stack;
}

function isElementBefore(element: HTMLElement, nextElement: HTMLElement) {
  const position = element.compareDocumentPosition(nextElement);
  const Node = getDocument(element).defaultView?.Node;
  if (!Node) return false;
  return Boolean(position & Node.DOCUMENT_POSITION_FOLLOWING);
}

function syncPortalOrder(stack: DialogStack) {
  // Default portal containers share a parent and rely on DOM order for visual
  // stacking, so keep their physical order aligned with the dialog stack.
  const nextPortals = new Map<HTMLElement, HTMLElement>();
  const seenPortals = new Set<HTMLElement>();
  for (let i = stack.dialogs.length - 1; i >= 0; i--) {
    const entry = stack.dialogs[i];
    if (!entry) continue;
    const portal = entry.portal;
    if (!portal) continue;
    if (seenPortals.has(portal)) continue;
    seenPortals.add(portal);
    const parent = portal.parentElement;
    if (!parent) continue;
    const nextPortal = nextPortals.get(parent);
    if (nextPortal && !isElementBefore(portal, nextPortal)) {
      parent.insertBefore(portal, nextPortal);
    }
    nextPortals.set(parent, portal);
  }
}

function updateDialogStack(stack: DialogStack) {
  syncPortalOrder(stack);
  stack.topologyVersion++;
  for (const listener of stack.listeners) {
    listener();
  }
}

function insertDialogStackEntry(stack: DialogStack, entry: DialogStackEntry) {
  // A nested portal paints within its ancestor's portal, so keep the whole
  // logical branch together when ordering it against sibling dialogs.
  const descendants = stack.dialogs.filter((current) =>
    isDialogStackAncestor(entry, current),
  );
  for (const descendant of descendants) {
    const index = stack.dialogs.indexOf(descendant);
    if (index >= 0) stack.dialogs.splice(index, 1);
  }

  const ancestor = getDialogStackAncestor(stack, entry);
  entry.groupActivation = ancestor?.groupActivation ?? entry.activation;

  let index = stack.dialogs.length;
  if (ancestor) {
    index = stack.dialogs.indexOf(ancestor) + 1;
    while (index < stack.dialogs.length) {
      const current = stack.dialogs[index];
      if (!current) break;
      if (!isDialogStackAncestor(ancestor, current)) break;
      const currentAncestor = getDialogStackAncestor(stack, current);
      if (
        currentAncestor === ancestor &&
        current.activation > entry.activation
      ) {
        break;
      }
      index++;
    }
  } else {
    const nextGroupIndex = stack.dialogs.findIndex(
      (current) => current.groupActivation > entry.groupActivation,
    );
    if (nextGroupIndex >= 0) index = nextGroupIndex;
  }

  stack.dialogs.splice(index, 0, entry);
  for (const descendant of descendants) {
    insertDialogStackEntry(stack, descendant);
  }
}

function isDialogStackAncestor(
  entry: DialogStackEntry,
  nestedEntry: DialogStackEntry,
) {
  const nestedStore = nestedEntry.store;
  if (nestedStore && entry.nestedDialogs.includes(nestedStore)) return true;
  return contains(entry.dialog, nestedEntry.dialog);
}

function getDialogStackAncestor(stack: DialogStack, entry: DialogStackEntry) {
  let ancestor: DialogStackEntry | undefined;
  for (const current of stack.dialogs) {
    if (current === entry) continue;
    if (!isDialogStackAncestor(current, entry)) continue;
    if (!ancestor || isDialogStackAncestor(ancestor, current)) {
      ancestor = current;
    }
  }
  return ancestor;
}

function reorderDialogStackEntry(stack: DialogStack, entry: DialogStackEntry) {
  const index = stack.dialogs.indexOf(entry);
  if (index < 0) return false;
  const previousDialogs = stack.dialogs.slice();
  stack.dialogs.splice(index, 1);
  insertDialogStackEntry(stack, entry);
  return previousDialogs.some(
    (dialog, index) => stack.dialogs[index] !== dialog,
  );
}

function haveSameDialogStores(
  stores: DialogStore[],
  nextStores: DialogStore[],
) {
  if (stores === nextStores) return true;
  if (stores.length !== nextStores.length) return false;
  for (const store of stores) {
    if (!nextStores.includes(store)) return false;
  }
  return true;
}

function getDialogStackElements(entries: DialogStackEntry[]) {
  return entries.flatMap(({ dialog, backdrop }) =>
    backdrop ? [dialog, backdrop] : [dialog],
  );
}

function getDialogPortal(
  dialog: HTMLElement,
  portal: HTMLElement | null | undefined,
) {
  if (!portal) return null;
  if (!contains(portal, dialog)) return null;
  return portal;
}

export function useDialogStack(
  dialog: HTMLElement | null | undefined,
  enabled: boolean,
  options?: DialogStackOptions,
) {
  const portal = options?.portal;
  const store = options?.store;
  const nestedDialogs = options?.nestedDialogs ?? emptyDialogStores;
  const [stackUpdated, forceUpdate] = useForceUpdate();
  const entryRef = useRef<DialogStackEntry | null>(null);
  const backdropRef = useRef<HTMLElement | null>(null);
  const activationRef = useRef<number | null>(null);

  const removeEntry = useCallback(() => {
    const entry = entryRef.current;
    if (!entry) return;
    entryRef.current = null;
    const stack = dialogStacks.get(entry.document);
    if (!stack) return;
    stack.listeners.delete(forceUpdate);
    const index = stack.dialogs.indexOf(entry);
    if (index >= 0) {
      stack.dialogs.splice(index, 1);
    }
    updateDialogStack(stack);
    if (stack.dialogs.length === 0) {
      stack.cleanup();
      dialogStacks.delete(entry.document);
    }
  }, [forceUpdate]);

  const setBackdrop = useCallback((backdrop: HTMLElement | null) => {
    backdropRef.current = backdrop;
    const entry = entryRef.current;
    if (!entry) return;
    if (entry.backdrop === backdrop) return;
    entry.backdrop = backdrop;
    const stack = dialogStacks.get(entry.document);
    if (!stack) return;
    updateDialogStack(stack);
  }, []);

  // Keep the activation for the lifetime of this opening so transient portal
  // states and replacement elements don't change its position in the stack.
  useSafeLayoutEffect(() => {
    if (!enabled) {
      activationRef.current = null;
      return;
    }
    return removeEntry;
  }, [enabled, removeEntry]);

  useSafeLayoutEffect(() => {
    if (!enabled) return;
    if (!dialog) return;
    // Portals briefly expose their inline placeholder through the dialog ref.
    // It may already be detached by the time this effect runs.
    if (!dialog.isConnected) return;
    const entry = entryRef.current;
    if (entry) {
      const nextDocument = getDocument(dialog);
      const stack = dialogStacks.get(entry.document);
      if (stack && entry.document === nextDocument) {
        const nextPortal = getDialogPortal(dialog, portal);
        const dialogUpdated = entry.dialog !== dialog;
        const portalUpdated = entry.portal !== nextPortal;
        const nestingUpdated =
          entry.store !== store ||
          !haveSameDialogStores(entry.nestedDialogs, nestedDialogs);
        if (!dialogUpdated && !portalUpdated && !nestingUpdated) {
          return;
        }
        entry.dialog = dialog;
        entry.portal = nextPortal;
        entry.store = store;
        entry.nestedDialogs = nestedDialogs;
        const reordered =
          nestingUpdated && reorderDialogStackEntry(stack, entry);
        if (dialogUpdated || portalUpdated || reordered) {
          updateDialogStack(stack);
        }
        return;
      }
      removeEntry();
    }
    const activation =
      activationRef.current ?? (activationRef.current = ++nextDialogActivation);
    const document = getDocument(dialog);
    const stack = getDialogStack(dialog);
    const nextEntry = {
      dialog,
      backdrop: backdropRef.current,
      portal: getDialogPortal(dialog, portal),
      document,
      activation,
      groupActivation: activation,
      store,
      nestedDialogs,
    };
    entryRef.current = nextEntry;
    stack.listeners.add(forceUpdate);
    insertDialogStackEntry(stack, nextEntry);
    updateDialogStack(stack);
  }, [dialog, enabled, forceUpdate, nestedDialogs, portal, removeEntry, store]);

  const stackedElements = useMemo(() => {
    // The registry lives outside React, so read its update signal here to
    // invalidate the derived array only when the stack changes.
    void stackUpdated;
    if (!enabled) return emptyElements;
    if (!dialog) return emptyElements;
    const entry = entryRef.current;
    if (!entry) return emptyElements;
    const stack = dialogStacks.get(entry.document);
    if (!stack) return emptyElements;
    const index = stack.dialogs.indexOf(entry);
    if (index < 0) return emptyElements;
    // Inline nested dialogs register before their DOM ancestors, which are
    // behind the current dialog rather than later dialogs in the stack.
    const elements = getDialogStackElements(
      stack.dialogs
        .slice(index + 1)
        .filter((entry) => !contains(entry.dialog, dialog)),
    );
    return elements.length ? elements : emptyElements;
  }, [dialog, enabled, stackUpdated]);

  const backgroundElements = useMemo(() => {
    void stackUpdated;
    if (!enabled) return emptyElements;
    if (!dialog) return emptyElements;
    const entry = entryRef.current;
    if (!entry) return emptyElements;
    const stack = dialogStacks.get(entry.document);
    if (!stack) return emptyElements;
    const index = stack.dialogs.indexOf(entry);
    if (index <= 0) return emptyElements;
    const elements = getDialogStackElements(stack.dialogs.slice(0, index));
    return elements.length ? elements : emptyElements;
  }, [dialog, enabled, stackUpdated]);

  const topologyVersion = useMemo(() => {
    // Host and portal changes alter the document topology even when
    // stackedElements remains the shared empty array.
    void stackUpdated;
    if (!enabled) return 0;
    const entry = entryRef.current;
    if (!entry) return 0;
    const stack = dialogStacks.get(entry.document);
    return stack?.topologyVersion ?? 0;
  }, [enabled, stackUpdated]);

  return [
    stackedElements,
    setBackdrop,
    topologyVersion,
    backgroundElements,
  ] as const;
}
