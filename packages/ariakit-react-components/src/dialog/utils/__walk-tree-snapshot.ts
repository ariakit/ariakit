import { setProperty } from "./orchestrate.ts";

export function getSnapshotPropertyName(id: string) {
  return `__ariakit-dialog-snapshot-${id}` as keyof Element;
}

// The name has no hyphen after "snapshot", so it can't be the snapshot property
// name of another dialog id, such as "ancestor-" followed by this id.
export function getSnapshotAncestorPropertyName(id: string) {
  return `__ariakit-dialog-snapshotAncestor-${id}` as keyof Element;
}

/**
 * Adds elements to the snapshot of the dialog. The snapshot takes every element
 * outside the dialog, so the list can be long. React can also replace the
 * element of another dialog that was already open when the snapshot was taken,
 * and the new element isn't in the snapshot.
 */
export function addToWalkTreeSnapshot(id: string, elements: Element[]) {
  return setSnapshotProperty(getSnapshotPropertyName(id), elements);
}

/**
 * Records the elements that contain the dialog when its snapshot is taken. They
 * were in the page at that time, but the snapshot has only the elements outside
 * the dialog, so it has their other children and not them.
 */
export function addAncestorsToWalkTreeSnapshot(
  id: string,
  ancestors: Element[],
) {
  return setSnapshotProperty(getSnapshotAncestorPropertyName(id), ancestors);
}

function setSnapshotProperty(propertyName: keyof Element, elements: Element[]) {
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
