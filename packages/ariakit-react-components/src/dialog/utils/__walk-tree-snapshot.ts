import { setProperty } from "./orchestrate.ts";

export function getSnapshotPropertyName(id: string) {
  return `__ariakit-dialog-snapshot-${id}` as keyof Element;
}

/**
 * Adds elements to the snapshot of the dialog. The snapshot takes every element
 * outside the dialog, so the list can be long. React can also replace the
 * element of another dialog that was already open when the snapshot was taken,
 * and the new element isn't in the snapshot.
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
