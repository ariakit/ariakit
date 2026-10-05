import { getDocument } from "@ariakit/utils";
import { setProperty } from "./orchestrate.ts";

export function getSnapshotPropertyName(id: string) {
  return `__ariakit-dialog-snapshot-${id}` as keyof Element;
}

// The snapshots that the elements that replaced another element joined, by
// element. A weak map keeps these elements from being retained after React
// removes them from the page, so nothing has to release them.
const replacementSnapshotIds = new WeakMap<Element, Set<string>>();

/**
 * Returns whether the element is in the snapshot of the dialog. An element is
 * in it when it or one of its ancestors has the snapshot property or replaced
 * an element that was in the snapshot. Without a snapshot, every element is in
 * it.
 */
export function isInWalkTreeSnapshot(id: string, element: Element) {
  const doc = getDocument(element);
  const propertyName = getSnapshotPropertyName(id);
  if (!doc.body[propertyName]) return true;
  do {
    if (element === doc.body) return false;
    if (element[propertyName]) return true;
    if (replacementSnapshotIds.get(element)?.has(id)) return true;
    if (!element.parentElement) return false;
    element = element.parentElement;
    // oxlint-disable-next-line no-constant-condition
  } while (true);
}

/**
 * Adds elements to the snapshot of the dialog. The snapshot takes every element
 * outside the dialog, so the list can be long.
 */
export function addToWalkTreeSnapshot(id: string, elements: Element[]) {
  const propertyName = getSnapshotPropertyName(id);
  const cleanups: Array<() => void> = [];
  for (const element of elements) {
    cleanups.push(setProperty(element, propertyName, true));
  }
  // The list can have more items than the engines accept as call arguments, so
  // the cleanups can't go through `chain(...cleanups)`.
  return () => {
    for (const cleanup of cleanups) {
      cleanup();
    }
  };
}

export interface ReplacedElement {
  previousElement: Element;
  // React removes the replaced element from the page, so it can't tell where it
  // was. Its parent from before the change can.
  previousParentElement: Element | null;
  replacementElement: Element;
}

/**
 * Adds the element that replaced another element to the snapshot of the dialog,
 * but only if the replaced element was in the snapshot. React can replace the
 * element of a dialog that was already open when the snapshot was taken, and
 * the new element isn't in the snapshot. The elements that other parts of the
 * page add later never were in it, and their replacements stay out too. Returns
 * whether the element was added.
 */
export function addReplacementToWalkTreeSnapshot(
  id: string,
  {
    previousElement,
    previousParentElement,
    replacementElement,
  }: ReplacedElement,
) {
  const wasInSnapshot =
    isInWalkTreeSnapshot(id, previousElement) ||
    (!!previousParentElement &&
      isInWalkTreeSnapshot(id, previousParentElement));
  if (!wasInSnapshot) return false;
  const ids = replacementSnapshotIds.get(replacementElement) ?? new Set();
  ids.add(id);
  replacementSnapshotIds.set(replacementElement, ids);
  return true;
}
