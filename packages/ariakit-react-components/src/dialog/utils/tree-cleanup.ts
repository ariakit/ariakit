import { chain } from "@ariakit/utils";
import { isBackdrop } from "./is-backdrop.ts";
import { setProperty } from "./orchestrate.ts";

export type Elements = Array<Element | null>;
export type Cleanups = Array<() => void>;
export type Ids = Array<string | undefined>;

function getPropertyName(id = "", ancestor = false) {
  return `__ariakit-dialog-${ancestor ? "ancestor" : "outside"}${
    id ? `-${id}` : ""
  }` as keyof Element;
}

export function markElement(element: Element, id = "") {
  return chain(
    setProperty(element, getPropertyName(), true),
    setProperty(element, getPropertyName(id), true),
  );
}

export function markAncestor(element: Element, id = "") {
  return chain(
    setProperty(element, getPropertyName("", true), true),
    setProperty(element, getPropertyName(id, true), true),
  );
}

export function isElementMarked(element: Element, id?: string) {
  const ancestorProperty = getPropertyName(id, true);
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
