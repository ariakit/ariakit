import type { RefObject } from "react";
import { isElementMarked } from "./tree-cleanup.ts";

type DialogRef = RefObject<Element | null>;

// The open dialogs, in the order that they opened. Each one is a ref, so a
// dialog keeps its place when its element changes while it's open.
const openDialogs = new Set<DialogRef>();

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
export function hasDialogAbove(dialog: Element) {
  if (!isElementMarked(dialog)) return false;
  let openedAfterDialog = false;
  let isAboveEarlierDialog = false;
  for (const { current: openDialog } of openDialogs) {
    if (openDialog === dialog) {
      openedAfterDialog = true;
      continue;
    }
    if (!openDialog) continue;
    if (!isElementMarked(dialog, openDialog.id)) continue;
    if (openedAfterDialog) return true;
    // A dialog that opened before is above too, unless the dialogs mark each
    // other.
    if (!isElementMarked(openDialog, dialog.id)) return true;
    isAboveEarlierDialog = true;
  }
  // The remaining marks count unless they come from the dialogs below the given
  // one. A mark can also come from outside the open dialogs, such as from
  // another copy of this module.
  return !(openedAfterDialog && isAboveEarlierDialog);
}
