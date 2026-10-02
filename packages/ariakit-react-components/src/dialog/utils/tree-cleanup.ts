import { chain } from "@ariakit/utils";
import { isBackdrop } from "./is-backdrop.ts";
import { setProperty } from "./orchestrate.ts";

export type Elements = Array<Element | null>;
export type Ids = Array<string | undefined>;

type CleanupKind = "mark" | "ancestorMark" | "disable" | "role";

// Keyed by element and kind, so the next walk can keep the cleanups of the
// elements that stay in the same state instead of restoring and setting them
// again.
export type Cleanups = Map<Element, ElementCleanups>;

type ElementCleanups = Map<CleanupKind, () => void>;

type MarkKind = "outside" | "ancestor";

// DOM IDs are only unique within a tree, so keying by the dialog element keeps
// same-ID dialogs in separate roots isolated. Weak collections also avoid
// retaining or mutating nodes used only for interaction membership.
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

/**
 * Marks elements the dialog knows about at open time (the dialog itself,
 * persistent elements, and nested dialogs), so outside event listeners can
 * recognize them as inside before the dialog has been focused.
 * @see https://github.com/ariakit/ariakit/issues/6344
 */
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

// The state of one tree walk. The walk moves the cleanups that it keeps from
// the previous walk.
export interface CleanupWalk {
  cleanups: Cleanups;
  previousCleanups?: Cleanups;
}

export function startCleanupWalk(previousCleanups?: Cleanups): CleanupWalk {
  return { cleanups: new Map(), previousCleanups };
}

export interface AddCleanupParams {
  walk: CleanupWalk;
  element: Element;
  kind: CleanupKind;
  setup: () => () => void;
}

/**
 * Adds the cleanup of an element to the walk. If the previous walk has a
 * cleanup for the same element and kind, the function moves that cleanup and
 * does not call `setup`.
 */
export function addCleanup({ walk, element, kind, setup }: AddCleanupParams) {
  const elementCleanups: ElementCleanups =
    walk.cleanups.get(element) ?? new Map();
  // A walk can visit the same ancestor once for each dialog element.
  if (elementCleanups.has(kind)) return;
  walk.cleanups.set(element, elementCleanups);
  const previousElementCleanups = walk.previousCleanups?.get(element);
  const previousCleanup = previousElementCleanups?.get(kind);
  previousElementCleanups?.delete(kind);
  elementCleanups.set(kind, previousCleanup ?? setup());
}

/**
 * Restores the cleanups that the walk did not keep from the previous walk. They
 * belong to elements that are no longer part of the walk.
 */
export function finishCleanupWalk(walk: CleanupWalk) {
  if (walk.previousCleanups) {
    restoreCleanups(walk.previousCleanups);
  }
  return walk.cleanups;
}

export interface AddElementMarkCleanupParams {
  walk: CleanupWalk;
  element: Element;
  id: string;
  ids: Ids;
}

export function addElementMarkCleanup({
  walk,
  element,
  id,
  ids,
}: AddElementMarkCleanupParams) {
  if (isBackdrop(element, ...ids)) return;
  addCleanup({
    walk,
    element,
    kind: "mark",
    setup: () => markElement(element, id),
  });
}

export interface AddAncestorMarkCleanupParams {
  walk: CleanupWalk;
  ancestor: Element;
  element: Element;
  id: string;
}

export function addAncestorMarkCleanup({
  walk,
  ancestor,
  element,
  id,
}: AddAncestorMarkCleanupParams) {
  // See https://github.com/ariakit/ariakit/issues/2687
  const isAnotherDialogAncestor =
    element.hasAttribute("data-dialog") && element.id !== id;
  if (isAnotherDialogAncestor) return;
  addCleanup({
    walk,
    element: ancestor,
    kind: "ancestorMark",
    setup: () => markAncestor(ancestor, id),
  });
}

export function restoreCleanups(cleanups: Cleanups) {
  for (const elementCleanups of cleanups.values()) {
    for (const cleanup of elementCleanups.values()) {
      cleanup();
    }
  }
  cleanups.clear();
}
