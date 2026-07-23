import { chain } from "@ariakit/utils";
import { isBackdrop } from "./is-backdrop.ts";
import { setProperty } from "./orchestrate.ts";

export type Elements = Array<Element | null>;
export type Cleanups = Array<() => void>;
export type Ids = Array<string | undefined>;

type MarkKind = "outside" | "ancestor";

const insideElements = new WeakMap<Element, WeakSet<Element>>();

function getPropertyName(id = "", kind: MarkKind = "outside") {
  return `__ariakit-dialog-${kind}${id ? `-${id}` : ""}` as keyof Element;
}

export function markElement(element: Element, id = "") {
  return chain(
    setProperty(element, getPropertyName(), true),
    setProperty(element, getPropertyName(id), true),
  );
}

export function markAncestor(element: Element, id = "") {
  return chain(
    setProperty(element, getPropertyName("", "ancestor"), true),
    setProperty(element, getPropertyName(id, "ancestor"), true),
  );
}

// Marks elements the dialog knows about at open time (the dialog itself,
// persistent elements, and nested dialogs), so the outside event listeners
// can positively recognize them as "inside" regardless of whether the dialog
// has been focused yet. See https://github.com/ariakit/ariakit/issues/6344
export function markTreeInside(dialog: Element, elements: Elements) {
  const marker = new WeakSet<Element>();
  insideElements.set(dialog, marker);
  for (const element of elements) {
    if (element) marker.add(element);
  }
  return () => {
    if (insideElements.get(dialog) !== marker) return;
    insideElements.delete(dialog);
  };
}

export function isElementInside(element: Element, dialog: Element) {
  const marker = insideElements.get(dialog);
  if (!marker) return false;
  do {
    if (marker.has(element)) return true;
    if (!element.parentElement) return false;
    element = element.parentElement;
    // oxlint-disable-next-line no-constant-condition
  } while (true);
}

export function isElementMarked(element: Element, id?: string) {
  const ancestorProperty = getPropertyName(id, "ancestor");
  if (element[ancestorProperty]) return true;
  const elementProperty = getPropertyName(id);
  do {
    if (element[elementProperty]) return true;
    if (!element.parentElement) return false;
    element = element.parentElement;
    // oxlint-disable-next-line no-constant-condition
  } while (true);
}

export interface AddElementMarkCleanupParams {
  cleanups: Cleanups;
  element: Element;
  id: string;
  ids: Ids;
}

export function addElementMarkCleanup({
  cleanups,
  element,
  id,
  ids,
}: AddElementMarkCleanupParams) {
  if (isBackdrop(element, ...ids)) return;
  cleanups.push(markElement(element, id));
}

export interface AddAncestorMarkCleanupParams {
  cleanups: Cleanups;
  ancestor: Element;
  element: Element;
  id: string;
}

export function addAncestorMarkCleanup({
  cleanups,
  ancestor,
  element,
  id,
}: AddAncestorMarkCleanupParams) {
  // See https://github.com/ariakit/ariakit/issues/2687
  const isAnotherDialogAncestor =
    element.hasAttribute("data-dialog") && element.id !== id;
  if (isAnotherDialogAncestor) return;
  cleanups.push(markAncestor(ancestor, id));
}

export function restoreCleanups(cleanups: Cleanups) {
  // Run in reverse so the most recently set properties restore first, matching
  // the previous unshift-based order without its O(n²) cost.
  for (let index = cleanups.length - 1; index >= 0; index -= 1) {
    cleanups[index]?.();
  }
}
