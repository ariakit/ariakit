import { contains } from "@ariakit/utils";
import type { RefObject } from "react";
import { isElementMarked } from "./tree-cleanup.ts";

type DialogRef = RefObject<Element | null>;

// The open dialogs, in the order that they opened. Each one is a ref, so a
// dialog keeps its place when its element changes while it's open. The value is
// the function that runs when the element of an earlier dialog changes.
const openDialogs = new Map<DialogRef, (() => void) | undefined>();

/**
 * Adds the dialog after the dialogs that are already open. The returned
 * function removes it. With `onEarlierDialogElementChange`, the dialog learns
 * when the element of a dialog that opened before it changes.
 */
export function addOpenDialog(
  dialogRef: DialogRef,
  onEarlierDialogElementChange?: () => void,
) {
  openDialogs.set(dialogRef, onEarlierDialogElementChange);
  return () => {
    openDialogs.delete(dialogRef);
  };
}

/**
 * Returns the elements of the dialogs that opened before the given dialog,
 * except the ones that contain it.
 */
export function getEarlierOpenDialogElements(dialogRef: DialogRef) {
  const elements: Element[] = [];
  for (const openDialogRef of openDialogs.keys()) {
    if (openDialogRef === dialogRef) break;
    const { current: element } = openDialogRef;
    if (!element?.isConnected) continue;
    if (dialogRef.current && contains(element, dialogRef.current)) continue;
    elements.push(element);
  }
  return elements;
}

/**
 * Tells the dialogs that opened after the given dialog that its element
 * changed.
 */
export function notifyOpenDialogElementChange(dialogRef: DialogRef) {
  let foundDialog = false;
  for (const [openDialogRef, onEarlierDialogElementChange] of openDialogs) {
    if (openDialogRef === dialogRef) {
      foundDialog = true;
      continue;
    }
    if (!foundDialog) continue;
    onEarlierDialogElementChange?.();
  }
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
  for (const { current: openDialog } of openDialogs.keys()) {
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
