import type { RefObject } from "react";
import { isElementMarked, isElementMarkedBy } from "./tree-cleanup.ts";

type DialogRef = RefObject<Element | null>;

// The open dialogs, in the order that they opened. Each one is a ref, so a
// dialog keeps its place when its element changes while it's open.
const openDialogs = new Set<DialogRef>();

const owners = new WeakMap<DialogRef, string>();
let ownerCount = 0;

// The marks are shared with other copies of this module, whose counters start
// at the same number, so the prefix keeps their keys apart.
const ownerPrefix = Math.random().toString(36).slice(2);

/**
 * Returns the key that the marks of the dialog carry. Unlike the dialog id, it
 * is unique to the dialog, because dialogs in different roots can share an id.
 * https://github.com/ariakit/ariakit/issues/7726
 */
export function getDialogOwner(dialogRef: DialogRef) {
  let owner = owners.get(dialogRef);
  if (!owner) {
    owner = `${ownerPrefix}-${++ownerCount}`;
    owners.set(dialogRef, owner);
  }
  return owner;
}

/**
 * Adds the dialog after the dialogs that are already open. The returned
 * function removes it.
 */
export function addOpenDialog(dialogRef: DialogRef) {
  openDialogs.add(dialogRef);
  return () => {
    openDialogs.delete(dialogRef);
  };
}

/**
 * Returns whether something is above the given dialog, which is the case when
 * the dialog is marked.
 *
 * The exception is two dialogs that mark each other, because a dialog also
 * marks a dialog that's in the DOM while hidden and opens later. In that case,
 * the dialog that opened last is above the other one.
 * https://github.com/ariakit/ariakit/issues/7647
 */
export function hasDialogAbove(dialogRef: DialogRef) {
  const dialog = dialogRef.current;
  if (!dialog) return false;
  if (!isElementMarked(dialog)) return false;
  const dialogOwner = getDialogOwner(dialogRef);
  let openedAfterDialog = false;
  let isAboveEarlierDialog = false;
  for (const openDialogRef of openDialogs) {
    const openDialog = openDialogRef.current;
    if (openDialogRef === dialogRef) {
      openedAfterDialog = true;
      continue;
    }
    if (!openDialog) continue;
    if (!isElementMarkedBy(dialog, getDialogOwner(openDialogRef))) continue;
    if (openedAfterDialog) return true;
    // A dialog that opened before is above too, unless the dialogs mark each
    // other.
    if (!isElementMarkedBy(openDialog, dialogOwner)) return true;
    isAboveEarlierDialog = true;
  }
  // The remaining marks count unless they come from the dialogs below the given
  // one. A mark can also come from outside the open dialogs, such as from
  // another copy of this module.
  return !(openedAfterDialog && isAboveEarlierDialog);
}
